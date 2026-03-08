import { useState, useCallback } from 'react';
import useStore from '../../store/useStore';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';
import { RATES } from '../../lib/constants';
import ChannelSelector from './ChannelSelector';
import RecentSends from './RecentSends';

const INPUT_CLASS =
  'bg-bg border border-border rounded-lg px-4 py-3 text-text-primary font-mono text-sm focus:border-accent focus:outline-none w-full transition-colors';

export default function SendConsole() {
  const budgetPercent = useStore((s) => s.budgetPercent);
  const budget = useStore((s) => s.budget);
  const updateBilling = useStore((s) => s.updateBilling);
  const addToast = useStore((s) => s.addToast);

  const [channel, setChannel] = useState('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [recentSends, setRecentSends] = useState([]);
  const [budgetError, setBudgetError] = useState(null);

  const cost = channel === 'email' ? RATES.email_send : RATES.slack_send;
  const recipientPlaceholder = channel === 'email' ? 'recipient@example.com' : '#channel or @user';

  const handleSend = useCallback(async () => {
    if (!recipient.trim() || !body.trim()) return;
    setSending(true);
    setBudgetError(null);
    try {
      const payload = { channel, recipient, body };
      if (channel === 'email') payload.subject = subject;
      const res = await api.send(payload);
      // Update billing state
      updateBilling(res.billing);
      // Add to recent sends
      const newMessage = { ...res.message, recipient };
      setRecentSends((prev) => [newMessage, ...prev].slice(0, 20));

      // Poll Supabase for status updates — server updates DB at 1s and 3.5s
      const messageId = res.message.id;
      const deadline = Date.now() + 6000;
      const pollInterval = setInterval(async () => {
        if (Date.now() > deadline) {
          clearInterval(pollInterval);
          return;
        }
        const { data } = await supabase
          .from('messages')
          .select('id, status')
          .eq('id', messageId)
          .single();
        if (data) {
          setRecentSends((prev) =>
            prev.map((m) => m.id === messageId ? { ...m, status: data.status } : m)
          );
          if (data.status === 'delivered' || data.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      }, 1000);

      // Clear form
      setRecipient('');
      setSubject('');
      setBody('');
      addToast({ type: 'success', message: 'Message sent successfully!' });
    } catch (err) {
      if (err?.error === 'BUDGET_EXCEEDED') {
        setBudgetError(err);
        addToast({ type: 'error', message: `Budget exceeded: $${err.currentSpend?.toFixed(2)} / $${err.budgetLimit?.toFixed(2)}` });
      } else {
        addToast({ type: 'error', message: err?.message || 'Send failed. Please try again.' });
      }
    } finally {
      setSending(false);
    }
  }, [channel, recipient, subject, body, updateBilling, addToast]);

  const canSend = recipient.trim() && body.trim() && !sending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-text-primary text-xl font-bold font-mono mb-1">Send Message</h1>
        <p className="text-text-muted text-sm font-mono">Send via Email or Slack using the OpenCourier API</p>
      </div>

      {/* Budget exceeded banner */}
      {budgetError && (
        <div className="bg-danger/10 border border-danger text-danger rounded-lg px-4 py-3 mb-4 font-mono text-sm">
          Budget exceeded — ${budgetError.currentSpend?.toFixed(2)} spent of ${budgetError.budgetLimit?.toFixed(2)} limit. Adjust budget in Billing settings.
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
        {/* Channel selector */}
        <ChannelSelector selectedChannel={channel} onSelect={setChannel} />

        {/* Recipient */}
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider font-mono block mb-1.5">
            Recipient
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={recipientPlaceholder}
            className={INPUT_CLASS}
          />
        </div>

        {/* Subject (email only) */}
        {channel === 'email' && (
          <div>
            <label className="text-text-muted text-xs uppercase tracking-wider font-mono block mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              className={INPUT_CLASS}
            />
          </div>
        )}

        {/* Body */}
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider font-mono block mb-1.5">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            rows={5}
            className={`${INPUT_CLASS} resize-none`}
          />
        </div>

        {/* Cost preview */}
        <div className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-2">
          <span className="text-text-muted text-xs font-mono">
            Cost: <span className="text-success">${cost.toFixed(4)}</span>
          </span>
          <span className="text-text-muted text-xs font-mono">
            Budget:{' '}
            <span className={budgetPercent >= 0.9 ? 'text-danger' : budgetPercent >= 0.75 ? 'text-warning' : 'text-text-primary'}>
              {(budgetPercent * 100).toFixed(0)}% used
            </span>
            {' '}of <span className="text-text-primary">${budget.limit_amount}</span>
          </span>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed w-full font-mono text-sm transition-colors"
        >
          {sending ? 'Sending...' : `Send via ${channel === 'email' ? 'Email' : 'Slack'}`}
        </button>
      </div>

      {/* Recent sends */}
      {recentSends.length > 0 && (
        <div className="mt-8">
          <h2 className="text-text-muted text-xs uppercase tracking-wider font-mono mb-3">Recent Sends</h2>
          <RecentSends messages={recentSends} />
        </div>
      )}
    </div>
  );
}
