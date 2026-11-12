import { useState } from 'react';
import { config } from '../config.js';

// The contact form posts to config.contactEndpoint, which emails
// Pranshav; on success the sheet gets a SENT stamp. If sending fails it offers
// his email address instead.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: '', email: '', message: '', _honey: '' };

export default function ReplySheet({ profile }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const set = k => e => { setFields(f => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors(x => ({ ...x, [k]: null })); };

  const submit = async e => {
    e.preventDefault();
    const err = {};
    if (!fields.name.trim()) err.name = 'Add your name.';
    if (!EMAIL.test(fields.email.trim())) err.email = 'Add an email I can reply to.';
    if (fields.message.trim().length < 10) err.message = 'Write a little more (at least 10 characters).';
    setErrors(err);
    if (Object.keys(err).length) return;
    setStatus('sending');
    try {
      const res = await fetch(config.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(), email: fields.email.trim(), message: fields.message.trim(),
          _subject: `Portfolio: a reply from ${fields.name.trim()}`, _replyto: fields.email.trim(), _template: 'table', _honey: fields._honey
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || res.statusText);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="reply reply--sent" role="status">
        <span className="reply__stamp" aria-hidden="true">Sent</span>
        <p className="reply__done">Thanks, {fields.name.trim().split(' ')[0]}. Your message is in my inbox, and I’ll reply to <b>{fields.email.trim()}</b>.</p>
        <button type="button" className="reply__alt mac-btn" onClick={() => { setFields(EMPTY); setStatus('idle'); }}>Write another</button>
      </div>
    );
  }

  return (
    <form className="reply" onSubmit={submit} noValidate aria-labelledby="reply-title">
      <h3 id="reply-title" className="reply__title">Send me a note</h3>
      <p className="reply__how">Add your name, an email I can reply to, and a message, then press <b>Send</b>. It goes straight to my inbox, and I’ll reply by email.</p>
      <label className="reply__field">
        <span>Your name</span>
        <input id="reply-name" type="text" name="name" autoComplete="name" placeholder="Jane Smith" value={fields.name} onChange={set('name')} aria-invalid={!!errors.name} />
        {errors.name && <em>{errors.name}</em>}
      </label>
      <label className="reply__field">
        <span>Your email</span>
        <input id="reply-email" type="email" name="email" autoComplete="email" placeholder="jane@company.com" value={fields.email} onChange={set('email')} aria-invalid={!!errors.email} />
        {errors.email && <em>{errors.email}</em>}
      </label>
      <label className="reply__field reply__field--message">
        <span>Message</span>
        <textarea id="reply-message" name="message" rows={4} placeholder="We’re hiring for…" value={fields.message} onChange={set('message')} aria-invalid={!!errors.message} />
        {errors.message && <em>{errors.message}</em>}
      </label>
      {/* Spam trap: invisible to people, filled in by bots. */}
      <input className="reply__honey" type="text" name="_honey" tabIndex={-1} autoComplete="off" value={fields._honey} onChange={set('_honey')} aria-hidden="true" />
      {status === 'error' && (
        <p className="reply__error" role="alert">That didn’t send. Email me directly at <b>{profile.email}</b>.</p>
      )}
      <button type="submit" className="reply__send mac-btn mac-btn--default" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send'}</button>
    </form>
  );
}
