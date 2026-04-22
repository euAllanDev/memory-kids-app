import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated
} from 'react-native';
import CardPairsGame from './games/CardPairsGame';
import SequenceGame from './games/SequenceGame';
import OrderGame from './games/OrderGame';

const MODES = [
  {
    id: 'pairs',
    emoji: '🃏',
    title: 'Par de Cartas',
    subtitle: 'Ache os pares iguais!',
    color: '#FF6B6B',
    bg: '#FFF0F0',
  },
  {
    id: 'sequence',
    emoji: '✨',
    title: 'Sequência Mágica',
    subtitle: 'Repita a ordem das cores!',
    color: '#6B8CFF',
    bg: '#F0F3FF',
  },
  {
    id: 'order',
    emoji: '📐',
    title: 'Ordem Certa',
    subtitle: 'Coloque do menor ao maior!',
    color: '#2ECC71',
    bg: '#F0FFF6',
  },
];

export default function App() {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === 'pairs') return <CardPairsGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'sequence') return <SequenceGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'order') return <OrderGame onBack={() => setActiveGame(null)} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFBF0" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
          <Text style={styles.title}>🧠 MemoryKids</Text>
          <Text style={styles.subtitle}>Escolha um jogo para jogar!</Text>
        </View>

        <View style={styles.cards}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.card, { backgroundColor: mode.bg, borderColor: mode.color }]}
              onPress={() => setActiveGame(mode.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>{mode.emoji}</Text>
              <Text style={[styles.cardTitle, { color: mode.color }]}>{mode.title}</Text>
              <Text style={styles.cardSubtitle}>{mode.subtitle}</Text>
              <View style={[styles.playBtn, { backgroundColor: mode.color }]}>
                <Text style={styles.playBtnText}>JOGAR ▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>Divirta-se e treine sua memória! 🌟</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFBF0' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  header: { alignItems: 'center', marginBottom: 24 },
  stars: { fontSize: 22, marginBottom: 4 },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2D2D2D',
    letterSpacing: -1,
  },
  subtitle: { fontSize: 16, color: '#888', marginTop: 4, fontWeight: '500' },
  cards: { gap: 16 },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardEmoji: { fontSize: 48, marginBottom: 6 },
  cardTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  cardSubtitle: { fontSize: 14, color: '#666', marginTop: 2, marginBottom: 14, fontWeight: '500' },
  playBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 50,
  },
  playBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  footer: { textAlign: 'center', marginTop: 28, fontSize: 15, color: '#AAA', fontWeight: '500' },
});