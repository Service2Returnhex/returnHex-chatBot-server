curl https://api.groq.com/openai/v1/chat/completions -s \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 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" \
-d '{
"model": "meta-llama/llama-4-scout-17b-16e-instruct",
"messages": [{
    "role": "user",
    "content": "Explain the importance of fast language models"
}]
}'

