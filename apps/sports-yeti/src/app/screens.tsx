import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { apiFetch } from './api';
import { useAuth } from './auth-context';

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      onLoggedIn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, onLoggedIn]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <TouchableOpacity onPress={submit} disabled={isLoading} style={{ backgroundColor: 'black', padding: 12 }}>
        <Text style={{ color: 'white' }}>{isLoading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export function DashboardScreen({ goToFacilities, goToChat, goToBooking, goToProfile }: { goToFacilities: () => void; goToChat: () => void; goToBooking: () => void; goToProfile: () => void }) {
  const { user, logout, leagueId, setLeagueId } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>Welcome {user?.name || ''}</Text>
      <TextInput value={leagueId || ''} onChangeText={setLeagueId} placeholder="League ID" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <TouchableOpacity onPress={goToFacilities} style={{ backgroundColor: '#143055', padding: 12, marginRight: 12 }}>
          <Text style={{ color: 'white' }}>Facilities</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToChat} style={{ backgroundColor: '#143055', padding: 12 }}>
          <Text style={{ color: 'white' }}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToBooking} style={{ backgroundColor: '#143055', padding: 12, marginLeft: 12, marginTop: 12 }}>
          <Text style={{ color: 'white' }}>Booking</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToProfile} style={{ backgroundColor: '#143055', padding: 12, marginLeft: 12, marginTop: 12 }}>
          <Text style={{ color: 'white' }}>Profile</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={logout} style={{ marginTop: 16 }}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export function FacilitiesScreen() {
  const { token, leagueId } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('Court 1');
  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: any[] }>(`/api/v1/leagues/${leagueId}/facilities`, {}, token || undefined, leagueId || undefined);
      setFacilities(res.data);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token, leagueId]);

  useEffect(() => {
    if (token && leagueId) load();
  }, [token, leagueId, load]);

  const create = useCallback(async () => {
    await apiFetch(`/api/v1/leagues/${leagueId}/facilities`, { method: 'POST', body: { name } }, token || undefined, leagueId || undefined);
    setName('');
    await load();
  }, [token, leagueId, name, load]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>Facilities</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput value={name} onChangeText={setName} placeholder="New facility name" style={{ borderWidth: 1, padding: 8, flex: 1 }} />
        <TouchableOpacity onPress={create} style={{ backgroundColor: 'black', padding: 12 }}>
          <Text style={{ color: 'white' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {facilities.map((f) => (
          <View key={f.id} style={{ paddingVertical: 8 }}>
            <Text>{f.name}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function BookingScreen() {
  const { token, leagueId } = useAuth();
  const [facilityId, setFacilityId] = useState('1');
  const [startAt, setStartAt] = useState('2025-01-01T10:00:00Z');
  const [endAt, setEndAt] = useState('2025-01-01T11:00:00Z');
  const [result, setResult] = useState<any | null>(null);
  const qr = result?.qr_code as string | undefined;

  const book = useCallback(async () => {
    const res = await apiFetch(`/api/v1/leagues/${leagueId}/bookings`, {
      method: 'POST',
      body: { facility_id: Number(facilityId), start_at: startAt, end_at: endAt },
      headers: { 'Idempotency-Key': `${Date.now()}` },
    }, token || undefined, leagueId || undefined);
    setResult(res);
  }, [token, leagueId, facilityId, startAt, endAt]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>Book</Text>
      <TextInput value={facilityId} onChangeText={setFacilityId} placeholder="Facility ID" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TextInput value={startAt} onChangeText={setStartAt} placeholder="Start ISO" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TextInput value={endAt} onChangeText={setEndAt} placeholder="End ISO" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TouchableOpacity onPress={book} style={{ backgroundColor: 'black', padding: 12 }}>
        <Text style={{ color: 'white' }}>Create Booking</Text>
      </TouchableOpacity>
      {result ? (
        <View style={{ marginTop: 12 }}>
          <Text selectable>{JSON.stringify(result)}</Text>
          {qr ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: '600' }}>Booking QR:</Text>
              <Text selectable style={{ fontFamily: 'Courier', marginTop: 4 }}>{qr}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function ChatScreen() {
  const { token, leagueId } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('Hello');

  const publish = useCallback(async () => {
    await apiFetch(`/api/v1/leagues/${leagueId}/chat/publish`, { method: 'POST', body: { message } }, token || undefined, leagueId || undefined);
    setMessage('');
  }, [token, leagueId, message]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>Chat</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput value={message} onChangeText={setMessage} placeholder="Message" style={{ borderWidth: 1, padding: 8, flex: 1 }} />
        <TouchableOpacity onPress={publish} style={{ backgroundColor: 'black', padding: 12 }}>
          <Text style={{ color: 'white' }}>Send</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>{messages.map((m, i) => (<Text key={i}>{m}</Text>))}</ScrollView>
    </SafeAreaView>
  );
}

export function ProfileScreen() {
  const { token } = useAuth();
  const [me, setMe] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<any>('/api/v1/auth/me', {}, token || undefined);
        setMe(res);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [token]);
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>Profile</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {me ? <Text selectable>{JSON.stringify(me)}</Text> : <Text>Loading...</Text>}
    </SafeAreaView>
  );
}


