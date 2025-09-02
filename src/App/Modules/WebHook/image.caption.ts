import axios from "axios";

export async function fetchPostAttachments(
  postId: string,
  pageAccessToken: string,
  apiVersion = "v23.0"
) {
  const fields = [
    "message",
    // request attachments and subattachments with description/title/media
    "attachments{media_type,media,description,title,subattachments{media,description,title,target}}",
  ].join(",");

  const url = `https://graph.facebook.com/${apiVersion}/${postId}`;
  const resp = await axios.get(url, {
    params: { fields, access_token: pageAccessToken },
    timeout: 10000,
  });

  return resp.data;
}
