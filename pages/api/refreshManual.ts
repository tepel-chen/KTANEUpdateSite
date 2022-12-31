import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { authOptions } from "./auth/[...nextauth]";
import refreshManual from "@Lib/refreshManual";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== "POST") {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    return;
  }

  const session = await unstable_getServerSession(req, res, authOptions);
  if (session) {
    res.send({
      content:
        "This is protected content. You can access this content because you are signed in.",
    });
  } else {
    try {
      await refreshManual();
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e });
    }  
  }
}