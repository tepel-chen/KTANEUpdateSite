import { NextApiRequest, NextApiResponse } from "next";
import checkForUpdates from "@Lib/checkForUpdates";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== "POST") {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    return;
  }

  try {
    await checkForUpdates();
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
  
}