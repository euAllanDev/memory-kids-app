import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated
} from 'react-native';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const ROUNDS = [
  {
    instruction: 'Do menor ao maior círculo 🔴',
    items: [
      { id: 1, size: 40, label: '🔴', order: 1 },
      { id: 2, size: 65, label: '🔴', order: 2 },
      { id: 3, size: 90, label: '🔴', order: 3 },
      { id: 4, size: 115, label: '🔴', order: 4 },
    ],
  },
  {
    instruction: 'Do menor ao maior quadrado 🟦',
    items: [
      { id: 1, size: 40, label: '🟦', order: 1 },
      { id: 2, size: 60, label: '🟦', order: 2 },
      { id: 3, size: 80, label: '🟦', order: 3 },
      { id: 4, size: 100, label: '🟦', order: 4 },
    ],
  },
  {
    instruction: 'Cores em ordem: 🔴 🟡 🟢 🔵',
    items: [
      { id: 1, size: 75, label: '🔴', order: 1 },
      { id: 2, size: 75, label: '🟡', order: 2 },
      { id: 3, size: 75, label: '🟢', order: 3 },
      { id: 4, size: 75, label: '🔵', order: 4 },
    ],
  },
];

export default function OrderGame({ onBack }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [items, setItems] = useState(shuffle(ROUNDS[0].items));
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState([]);
  const [phase, setPhase] = useState('play'); // play | checking | win | wrong
  const [wrongIdx, setWrongIdx] = useState(null);
  const [score, setScore] = useState(0);

  const round = ROUNDS[roundIdx];

  function startRound(idx) {
    setRoundIdx(idx);
    setItems(shuffle(ROUNDS[idx].items));
    setSelected(null);
    setAnswer([]);
    setPhase('play');
    setWrongIdx(null);
  }

  function pickItem(item) {
    if (phase !== 'play') return;
    if (answer.find(a => a.id === item.id)) return;

    const newAnswer = [...answer, item];
    setAnswer(newAnswer);

    if (newAnswer.length === round.items.length) {
      // check
      const correct = newAnswer.every((a, i) => a.order === i + 1);
      if (correct) {
        setScore(s => s + 1);
        setPhase('win');
      } else {
        // find first wrong
        const wi = newAnswer.findIndex((a, i) => a.order !== i + 1);
        setWrongIdx(wi);
        setPhase('wrong');
        setTimeout(() => {
          setAnswer([]);
          setPhase('play');
          setWrongIdx(null);
        }, 1200);
      }
    }
  }

  function nextRound() {
    if (roundIdx + 1 < ROUNDS.length) {
      startRound(roundIdx + 1);
    } else {
      setPhase('finished');
    }
  }

  const answeredIds = new Set(answer.map(a => a.id));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📐 Ordem Certa</Text>
        <Text style={styles.score}>⭐ {score}/{ROUNDS.length}</Text>
      </View>

      {phase === 'finished' ? (
        <View style={styles.center}>
          <Text style={styles.finEmoji}>🏆</Text>
          <Text style={styles.finTitle}>Incrível!</Text>
          <Text style={styles.finMsg}>Você completou todos os desafios com {score} estrelas!</Text>
          <TouchableOpacity style={styles.playBtn} onPress={() => { setScore(0); startRound(0); }}>
            <Text style={styles.playBtnText}>Jogar de novo 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={onBack}>
            <Text style={styles.homeText}>Menu Principal 🏠</Text>
          </TouchableOpacity>
        </View>
      ) : phase === 'win' ? (
        <View style={styles.center}>
          <Text style={styles.winEmoji}>🎉</Text>
          <Text style={styles.winTitle}>Correto!</Text>
          <Text style={styles.winMsg}>Você acertou a ordem!</Text>
          <TouchableOpacity style={styles.playBtn} onPress={nextRound}>
            <Text style={styles.playBtnText}>
              {roundIdx + 1 < ROUNDS.length ? 'Próximo desafio ➡️' : 'Ver resultado 🏆'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.instructBox}>
            <Text style={styles.instructText}>{round.instruction}</Text>
            <Text style={styles.roundLabel}>Desafio {roundIdx + 1} de {ROUNDS.length}</Text>
          </View>

          {/* Answer slots */}
          <View style={styles.slotsRow}>
            {Array.from({ length: round.items.length }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.slot,
                  phase === 'wrong' && i === wrongIdx && styles.slotWrong,
                  answer[i] && styles.slotFilled,
                ]}
              >
                {answer[i] ? (
                  <Text style={{ fontSize: answer[i].size * 0.45 }}>{answer[i].label}</Text>
                ) : (
                  <Text style={styles.slotEmpty}>{i + 1}</Text>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.hint}>Toque nas formas na ordem certa 👇</Text>

          {/* Item bank */}
          <View style={styles.bank}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => pickItem(item)}
                disabled={answeredIds.has(item.id)}
                style={[styles.itemBtn, answeredIds.has(item.id) && styles.itemUsed]}
              >
                <Text style={{ fontSize: item.size * 0.45, opacity: answeredIds.has(item.id) ? 0.25 : 1 }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {answer.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setAnswer([]); setPhase('play'); }}
            >
              <Text style={styles.clearText}>Limpar ↩️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FFF6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 16, color: '#2ECC71', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '900', color: '#2D2D2D' },
  score: { fontSize: 16, color: '#2ECC71', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  finEmoji: { fontSize: 80 },
  finTitle: { fontSize: 42, fontWeight: '900', color: '#2ECC71' },
  finMsg: { fontSize: 17, color: '#555', textAlign: 'center', fontWeight: '600', lineHeight: 24 },
  winEmoji: { fontSize: 80 },
  winTitle: { fontSize: 42, fontWeight: '900', color: '#2ECC71' },
  winMsg: { fontSize: 18, color: '#555', fontWeight: '600' },
  playBtn: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 8,
  },
  playBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  homeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2ECC71',
  },
  homeText: { color: '#2ECC71', fontWeight: '800', fontSize: 17 },
  gameArea: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  instructBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#2ECC71',
    alignItems: 'center',
    width: '100%',
  },
  instructText: { fontSize: 18, fontWeight: '800', color: '#2D2D2D', textAlign: 'center' },
  roundLabel: { fontSize: 13, color: '#999', marginTop: 4, fontWeight: '600' },
  slotsRow: { flexDirection: 'row', gap: 10 },
  slot: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  slotFilled: { borderStyle: 'solid', backgroundColor: '#F0FFF6' },
  slotWrong: { borderColor: '#FF6B6B', backgroundColor: '#FFF0F0' },
  slotEmpty: { fontSize: 22, color: '#CCC', fontWeight: '700' },
  hint: { fontSize: 14, color: '#888', fontWeight: '600' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  itemBtn: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2ECC71',
    shadowColor: '#2ECC71',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  itemUsed: { borderColor: '#ddd', shadowOpacity: 0 },
  clearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  clearText: { color: '#FF6B6B', fontWeight: '700', fontSize: 15 },
});