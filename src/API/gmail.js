export async function listLabels() {
  const response = await window.gapi.client.gmail.users.labels.list({
    userId: "me",
  });

  return response;
}

export async function listMessages() {
  const response = await window.gapi.client.gmail.users.messages.list({
    userId: "me",
  });
  return response;
}

export async function getMessage(id) {
  console.log(id);
  const response = await window.gapi.client.gmail.users.messages.get({
    userId: "me",
    id,
  });
  return response;
}
