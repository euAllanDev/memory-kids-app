import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated
} from 'react-native';

const SHAPES = [
  { id: 0, color: '#FF6B6B', label: '🔴', activeColor: '#FF2222' },
  { id: 1, color: '#6B8CFF', label: '🔵', activeColor: '#1144FF' },
  { id: 2, color: '#2ECC71', label: '🟢', activeColor: '#00AA44' },
  { id: 3, color: '#F1C40F', label: '🟡', activeColor: '#CC9900' },
];

const PHASE = { WATCH: 'watch', INPUT: 'input', WIN: 'win', LOSE: 'lose' };

export default function SequenceGame({ onBack }) {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [phase, setPhase] = useState(PHASE.WATCH);
  const [activeShape, setActiveShape] = useState(null);
  const [level, setLevel] = useState(1);
  const [started, setStarted] = useState(false);
  const scaleAnims = useRef(SHAPES.map(() => new Animated.Value(1))).current;

  function flashShape(id) {
    setActiveShape(id);
    Animated.sequence([
      Animated.timing(scaleAnims[id], { toValue: 1.18, duration: 160, useNativeDriver: true }),
      Animated.timing(scaleAnims[id], { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start(() => setActiveShape(null));
  }

  function playSequence(seq) {
    setPhase(PHASE.WATCH);
    let delay = 600;
    seq.forEach((id, i) => {
      setTimeout(() => flashShape(id), delay * (i + 1));
    });
    setTimeout(() => setPhase(PHASE.INPUT), delay * (seq.length + 1));
  }

  function startGame() {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setPlayerInput([]);
    setLevel(1);
    setStarted(true);
    setTimeout(() => playSequence(first), 500);
  }

  function handlePress(id) {
    if (phase !== PHASE.INPUT) return;
    flashShape(id);
    const newInput = [...playerInput, id];
    const pos = newInput.length - 1;

    if (newInput[pos] !== sequence[pos]) {
      setPhase(PHASE.LOSE);
      return;
    }

    if (newInput.length === sequence.length) {
      // Level complete!
      const newLevel = level + 1;
      setLevel(newLevel);
      const newSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSeq);
      setPlayerInput([]);
      setTimeout(() => playSequence(newSeq), 900);
    } else {
      setPlayerInput(newInput);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>✨ Sequência Mágica</Text>
        <Text style={styles.level}>Nível {level}</Text>
      </View>

      {!started ? (
        <View style={styles.center}>
          <Text style={styles.instructEmoji}>👀</Text>
          <Text style={styles.instructTitle}>Como jogar:</Text>
          <Text style={styles.instructText}>Observe a sequência de cores que pisca e repita na mesma ordem!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startText}>Começar! 🚀</Text>
          </TouchableOpacity>
        </View>
      ) : phase === PHASE.LOSE ? (
        <View style={styles.center}>
          <Text style={styles.loseEmoji}>😅</Text>
          <Text style={styles.loseTitle}>Quase!</Text>
          <Text style={styles.loseMsg}>Você chegou até o nível {level}!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startText}>Tentar de novo 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={onBack}>
            <Text style={styles.homeText}>Menu Principal 🏠</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.statusBox}>
            {phase === PHASE.WATCH ? (
              <Text style={styles.statusText}>👀 Observe atentamente...</Text>
            ) : (
              <Text style={styles.statusText}>
                👆 Sua vez! ({playerInput.length}/{sequence.length})
              </Text>
            )}
          </View>
          <View style={styles.shapeGrid}>
            {SHAPES.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => handlePress(s.id)}
                activeOpacity={0.85}
              >
                <Animated.View
                  style={[
                    styles.shape,
                    {
                      backgroundColor: activeShape === s.id ? s.activeColor : s.color,
                      transform: [{ scale: scaleAnims[s.id] }],
                    },
                  ]}
                >
                  <Text style={styles.shapeLabel}>{s.label}</Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dots}>
            {sequence.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i < playerInput.length && styles.dotFilled]}
              />
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F3FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 16, color: '#6B8CFF', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '900', color: '#2D2D2D' },
  level: { fontSize: 16, color: '#6B8CFF', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  instructEmoji: { fontSize: 64 },
  instructTitle: { fontSize: 26, fontWeight: '900', color: '#2D2D2D' },
  instructText: { fontSize: 16, color: '#555', textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  startBtn: {
    backgroundColor: '#6B8CFF',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 8,
  },
  startText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  homeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#6B8CFF',
  },
  homeText: { color: '#6B8CFF', fontWeight: '800', fontSize: 17 },
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'space-around', padding: 20 },
  statusBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6B8CFF',
  },
  statusText: { fontSize: 17, fontWeight: '700', color: '#333' },
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    width: '90%',
  },
  shape: {
    width: 130,
    height: 130,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  shapeLabel: { fontSize: 52 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#6B8CFF',
  },
  dotFilled: { backgroundColor: '#6B8CFF' },
  loseEmoji: { fontSize: 72 },
  loseTitle: { fontSize: 42, fontWeight: '900', color: '#6B8CFF' },
  loseMsg: { fontSize: 18, color: '#666', fontWeight: '600' },
});