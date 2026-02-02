import { writable } from "svelte/store";
import type { RoomData } from "@common/comms";

export const rooms = writable<RoomData[]>([]);
