const handleWebhook = async (query: any, body: any) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return challenge
  } else { 
    return "Webhook verification failed";
  }
    
};

export const WebHookService = {
  handleWebhook,
};
