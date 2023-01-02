import { NextApiRequest, NextApiResponse } from "next";
import { deleteToBeTranslated } from "@Lib/translation/delete";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== "POST") {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    return;
  }

  try {
    const { id } = JSON.parse(req.body);
    await deleteToBeTranslated(id);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
  
}