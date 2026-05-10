<?php
/**
 * Triggers a rebuild of the public site and atomically swaps the new
 * dist into the web root.
 *
 * Hook this into your CMS auth so only logged-in users can hit it.
 * Expected to be POSTed from the "Publish to website" button.
 *
 * Configure the three paths below to match your server layout. The
 * defaults assume:
 *   - The repository lives at /var/www/website
 *   - The public web root is /var/www/public_html
 *   - Node is on the PATH for the web user (or pass an absolute path
 *     to "npm" / "node" below)
 */

declare(strict_types=1);

header('Content-Type: application/json');

// --- Config --------------------------------------------------------------
$repoRoot         = '/var/www/website';
$publicWebRoot    = '/var/www/public_html';
$npmBin           = 'npm';
$gitBin           = 'git';
$pullBeforeBuild  = true;
// ------------------------------------------------------------------------

function fail(string $msg, int $code = 500): void {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  fail('POST required', 405);
}

// NOTE: enforce session/auth here. Example:
// session_start();
// if (empty($_SESSION['user'])) fail('Not authenticated', 401);

$publicApp = $repoRoot . '/apps/public';
if (!is_dir($publicApp)) fail("apps/public not found at {$publicApp}");

$steps = [];
$run = function (string $cmd, string $cwd) use (&$steps): array {
  $descriptors = [1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
  $proc = proc_open($cmd, $descriptors, $pipes, $cwd, null);
  if (!is_resource($proc)) return ['ok' => false, 'cmd' => $cmd, 'stdout' => '', 'stderr' => 'proc_open failed', 'code' => -1];
  $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
  $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
  $code = proc_close($proc);
  $entry = ['ok' => $code === 0, 'cmd' => $cmd, 'stdout' => $stdout, 'stderr' => $stderr, 'code' => $code];
  $steps[] = $entry;
  return $entry;
};

if ($pullBeforeBuild && is_dir($repoRoot . '/.git')) {
  $r = $run("$gitBin -C " . escapeshellarg($repoRoot) . " pull --ff-only", $repoRoot);
  if (!$r['ok']) fail("git pull failed: " . trim($r['stderr']));
}

$r = $run("$npmBin ci --omit=dev --silent", $publicApp);
if (!$r['ok']) {
  $r = $run("$npmBin install --silent", $publicApp);
  if (!$r['ok']) fail("npm install failed: " . trim($r['stderr']));
}

$r = $run("$npmBin run build --silent", $publicApp);
if (!$r['ok']) fail("build failed: " . trim($r['stderr']));

$dist = $publicApp . '/dist';
if (!is_dir($dist)) fail('build produced no dist/');

$newRoot = $publicWebRoot . '.new';
$prevRoot = $publicWebRoot . '.prev';

// Atomic swap: copy dist -> .new, rename current -> .prev, rename .new -> current
if (is_dir($newRoot)) {
  $run("rm -rf " . escapeshellarg($newRoot), $publicApp);
}
$r = $run("cp -r " . escapeshellarg($dist) . " " . escapeshellarg($newRoot), $publicApp);
if (!$r['ok']) fail("copy dist failed: " . trim($r['stderr']));

if (is_dir($prevRoot)) {
  $run("rm -rf " . escapeshellarg($prevRoot), $publicApp);
}

if (is_dir($publicWebRoot)) {
  if (!@rename($publicWebRoot, $prevRoot)) fail("could not move current web root aside");
}
if (!@rename($newRoot, $publicWebRoot)) {
  // Recover
  if (is_dir($prevRoot)) @rename($prevRoot, $publicWebRoot);
  fail("could not move new web root into place");
}

echo json_encode([
  'ok' => true,
  'message' => 'Published',
  'publishedAt' => gmdate('c'),
]);
