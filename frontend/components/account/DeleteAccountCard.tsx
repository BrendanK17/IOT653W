import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/Toast';
import API_BASE from '../../utils/api';

interface DeleteAccountCardProps {
  userEmail: string;
  onDeleted: () => void;
}

export const DeleteAccountCard: React.FC<DeleteAccountCardProps> = ({ userEmail, onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submitDelete = async () => {
    if (!password) {
      toast.showToast('Please enter your password to confirm', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.showToast(body.detail || body.error || 'Failed to delete account', 'error');
        return;
      }
      toast.showToast('Account deleted', 'success');
      onDeleted();
    } catch (e) {
      console.error(e);
      toast.showToast('Network error while deleting account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>Permanently delete your account and all associated data.</CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <Button variant="destructive" className="w-full" onClick={() => setConfirming(true)}>
              Delete my account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="confirm-password">Confirm with password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={submitDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Confirm delete'}
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => { setConfirming(false); setPassword(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeleteAccountCard;
