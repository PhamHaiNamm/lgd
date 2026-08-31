import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const SupportKnowledgeContext = createContext({
  aiContext: null,
  loading: true,
});

function normalizeScheduleItems(items) {
  return items
    .filter((item) => item && item.date)
    .sort((a, b) => {
      const dateCompare = String(a.date).localeCompare(String(b.date));
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return String(a.time || '').localeCompare(String(b.time || ''));
    })
    .slice(0, 30)
    .map((item) => ({
      date: item.date || '',
      time: item.time || '',
      location: item.location || '',
      content: item.content || '',
      note: item.note || '',
    }));
}

function buildUpcomingSchedule(schedule) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 2);

  return schedule.filter((item) => {
    if (!item.date) {
      return false;
    }
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= today && itemDate <= maxDate;
  });
}

export function SupportKnowledgeProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadKnowledge() {
      try {
        const [membersSnap, scheduleSnap] = await Promise.all([
          getDoc(doc(db, 'config', 'team_members')),
          getDoc(doc(db, 'config', 'schedule')),
        ]);

        if (cancelled) {
          return;
        }

        const membersData = membersSnap.exists() && Array.isArray(membersSnap.data().members)
          ? membersSnap.data().members
          : [];

        const scheduleData = scheduleSnap.exists() && Array.isArray(scheduleSnap.data().items)
          ? scheduleSnap.data().items
          : [];

        setMembers(
          membersData.map((member) => ({
            id: member.id || '',
            name: member.name || '',
            role: member.role || 'Đang cập nhật',
            birthYear: member.birthYear || 'Đang cập nhật',
          }))
        );
        setSchedule(normalizeScheduleItems(scheduleData));
      } catch (error) {
        if (!cancelled) {
          setMembers([]);
          setSchedule([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadKnowledge();

    return () => {
      cancelled = true;
    };
  }, []);

  const aiContext = useMemo(() => ({
    foundedYear: 2023,
    memberCount: members.length,
    members,
    schedule,
    upcomingSchedule: buildUpcomingSchedule(schedule),
  }), [members, schedule]);

  return (
    <SupportKnowledgeContext.Provider value={{ aiContext, loading }}>
      {children}
    </SupportKnowledgeContext.Provider>
  );
}

export function useSupportKnowledge() {
  return useContext(SupportKnowledgeContext);
}
