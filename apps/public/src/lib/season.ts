import upcomingJson from "../data/concerts-upcoming.json";
import pastJson from "../data/concerts-past.json";
import { type Concert, splitByDate } from "./concert";

const split = splitByDate(upcomingJson as Concert[], pastJson as Concert[]);

export const upcomingConcerts: Concert[] = split.upcoming;
export const pastConcerts: Concert[] = split.past;
