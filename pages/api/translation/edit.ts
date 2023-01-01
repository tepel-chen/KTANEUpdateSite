import { NextApiRequest, NextApiResponse } from "next";
import { editToBeTranslated } from "@Lib/translation/edit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== "POST") {
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
    return;
  }

  console.log(req.body);
  try {
    const data = JSON.parse(req.body);
    await editToBeTranslated(data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
  
}