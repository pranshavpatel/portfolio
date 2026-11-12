// Settings. Change them here.
export const config = {
  smoothScroll: true,
  // Where the reply form posts. FormSubmit relays it to this address by email
  // (the first message triggers a one-time activation email to confirm).
  // To switch to Formspree or Web3Forms, change this URL and the payload in
  // ReplySheet.jsx.
  contactEndpoint: 'https://formsubmit.co/ajax/pranshavpatel1803@gmail.com'
};

export const asset = path => import.meta.env.BASE_URL + path;
