const API_KEY = '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';
const apiUrl = 'https://api.openai.com/v1/chat/completions';

export async function createCompletion(model, messages) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map(message => ({
        role: message.role,
        content: message.content,
      })),
    }),
  };

  console.log(requestOptions)
 // try {
   // const response = await fetch(apiUrl, requestOptions);
   // const data = await response.json();
   // if (data.choices && data.choices.length > 0) {
   //   return data.choices[0].message.content.trim();
   // } else {
   //   return 'Sorry, I couldn\'t generate a response.';
   // }
 // } catch (error) {
   // console.error('Error fetching data from OpenAI API:', error);
   // return 'Error: Unable to fetch data from OpenAI API.';
//  }
}
