// -----------------------------------------------------------------------------
// Title:       DesktopPet.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-25
// Last Modified: 2026-03-27
// Purpose:     Main Glim application component. Owns all interaction logic,
//              timer-based behaviors, and state coordination across stores.
//              Sub-components (Background, OwlMoth, panels, etc.) are in
//              src/components/. CSS keyframes are in glim-animations.css.
// Inputs:      Zustand stores (6 domain stores), messages.js, utils.js
// Outputs:     Default export: DesktopPet component
// -----------------------------------------------------------------------------

import { useEffect, useRef, useCallback } from 'react';
import {
  MESSAGES, MOVE_REMINDERS, EYES_REMINDERS, MOVE_DONE_RESPONSES,
  EYES_DONE_RESPONSES, MINDFULNESS, DISCOVERIES, JOURNAL_PROMPTS,
  JOURNAL_NUDGES, SCIENCE_FACTS
} from './messages.js';
import './storage.js';
import './glim-animations.css';
import { pickRandom } from './utils';
import {
  useCreatureStore, useMessageStore, useSettingsStore,
  useUIStore, useJournalStore, usePokesStore,
} from './stores';
import Background from './components/Background';
import AmbientBugs from './components/AmbientBugs';
import SpeechBubble from './components/SpeechBubble';
import OwlMoth from './components/OwlMoth';
import PersistentReminder from './components/PersistentReminder';
import SettingsPanel from './components/SettingsPanel';
import JournalPanel from './components/JournalPanel';


export default function DesktopPet() {
  // ---- Store reads ----
  const {
    mood, hue, sat,
    isHappy, squeezed, isPuffed, isPurring, specialAnim,
    antennaPerk, wingTwitchSide, isBlinking, isShaken,
    pupilOffset, chasedBugId,
    dragPos, isDragging, isReturning,
    updateTime, setIsHappy, setSqueezed, setIsPuffed, setIsPurring,
    setSpecialAnim, setAntennaPerk, setWingTwitchSide, setIsBlinking,
    setIsShaken, setPupilOffset, setChasedBugId,
    setDragPos, setIsDragging, setIsReturning, setIsWandering,
  } = useCreatureStore();

  const {
    message, showBubble, isWellness, currentMsgType, moveReminder, eyesReminder,
    setMessage, setShowBubble, setIsWellness, setCurrentMsgType,
    setMoveReminder, setEyesReminder,
  } = useMessageStore();

  const { wellnessInterval, moveInterval, eyesInterval,
    reload: reloadSettings,
  } = useSettingsStore();

  const { journalPrompt, setJournalText, setJournalPrompt } = useUIStore();

  const { reload: reloadJournal, addEntry: addJournalEntry } = useJournalStore();

  const { total: clickCount, increment: setClickCount, reload: reloadPokes } = usePokesStore();

  // ---- Drag refs ----
  const dragStartRef = useRef(null);
  const wanderTimerRef = useRef(null);
  const wanderDriftRef = useRef(null);
  const justDraggedRef = useRef(false);
  const dragVelocityRef = useRef([]);
  const shakeTimerRef = useRef(null);

  // ---- Refs ----
  const bubbleTimer = useRef(null);
  const idleTimer = useRef(null);
  const wellnessTimer = useRef(null);
  const happyTimer = useRef(null);
  const moveTimer = useRef(null);
  const eyesTimer = useRef(null);
  const lastWellnessRef = useRef("");
  const lastEncouragementRef = useRef("");
  const clickTimesRef = useRef([]);
  const lastInteractionRef = useRef(Date.now());
  const holdTimerRef = useRef(null);
  const creatureRef = useRef(null);
  const puffTimerRef = useRef(null);
  const specialTimerRef = useRef(null);
  const isSleepingRef = useRef(false);

  // ---- Time updates ----
  useEffect(() => {
    const iv = setInterval(() => { updateTime(); }, 60000);
    return () => clearInterval(iv);
  }, []);

  // Keep sleep ref in sync
  useEffect(() => {
    isSleepingRef.current = specialAnim === "sleep";
  }, [specialAnim]);

  // ---- Load journal and pokes on mount ----
  useEffect(() => { reloadJournal(); }, []);
  useEffect(() => { reloadPokes(); }, []);

  // ---- Listen for sync service updates (cross-device data arriving) ----
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.domains?.includes('journal')) reloadJournal();
      if (e.detail?.domains?.includes('pokes')) reloadPokes();
      if (e.detail?.domains?.includes('settings')) reloadSettings();
    };
    window.addEventListener('glim-data-updated', handler);
    return () => window.removeEventListener('glim-data-updated', handler);
  }, [reloadJournal, reloadPokes, reloadSettings]);

  // ---- Eye tracking ----
  // Uses isSleepingRef so the callback is stable (no dep on specialAnim)
  const handleMouseMove = useCallback((e) => {
    if (!creatureRef.current || isSleepingRef.current) return;
    const rect = creatureRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.4;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 300;
    const norm = Math.min(dist / maxDist, 1);
    setPupilOffset({
      x: (dx / (dist || 1)) * norm,
      y: (dy / (dist || 1)) * norm,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ---- Rare blink (every 45-90s, very infrequent) ----
  // Uses isPurringRef to avoid stale closure; cleanup kills old chain on unmount
  const isPurringRef = useRef(false);
  useEffect(() => { isPurringRef.current = isPurring; }, [isPurring]);

  useEffect(() => {
    const blinkTimer = { current: null };
    const scheduleBlink = () => {
      blinkTimer.current = setTimeout(() => {
        if (!isSleepingRef.current && !isPurringRef.current) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 250);
        }
        scheduleBlink();
      }, Math.random() * 45000 + 45000);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimer.current);
  }, []);

  // ---- Random wing twitches ----
  useEffect(() => {
    const twitchTimer = { current: null };
    const scheduleTwitch = () => {
      twitchTimer.current = setTimeout(() => {
        const side = Math.random() > 0.5 ? "left" : "right";
        setWingTwitchSide(side);
        setTimeout(() => setWingTwitchSide(null), 350);
        scheduleTwitch();
      }, Math.random() * 12000 + 6000);
    };
    scheduleTwitch();
    return () => clearTimeout(twitchTimer.current);
  }, []);

  // ---- Idle wandering ----
  useEffect(() => {
    const scheduleWander = () => {
      const delay = Math.random() * 20000 + 15000; // every 15-35s
      wanderTimerRef.current = setTimeout(() => {
        if (!isDragging && !isReturning && !specialAnim) {
          setIsWandering(true);
          const wx = (Math.random() - 0.5) * 40;
          const wy = (Math.random() - 0.5) * 25;
          setDragPos({ x: wx, y: wy });
          // Drift back slowly
          wanderDriftRef.current = setTimeout(() => {
            setDragPos({ x: 0, y: 0 });
            wanderDriftRef.current = setTimeout(() => setIsWandering(false), 3000);
          }, 2500);
        }
        scheduleWander();
      }, delay);
    };
    scheduleWander();
    return () => { clearTimeout(wanderTimerRef.current); clearTimeout(wanderDriftRef.current); };
  }, [isDragging, isReturning, specialAnim]);

  // ---- Antenna perk on message ----
  useEffect(() => {
    if (showBubble) {
      setAntennaPerk(true);
      const t = setTimeout(() => setAntennaPerk(false), 500);
      return () => clearTimeout(t);
    }
  }, [showBubble]);

  // ---- Unprompted behaviors ----
  // Single weighted random draw so documented percentages are exact.
  // Weights: secret 3%, sleep 3% (requires >15min idle), fly 20%,
  //          chase 25%, discovery 30%, nothing 19%.  Total = 100%.
  useEffect(() => {
    const scheduleSpecial = () => {
      const delay = Math.random() * 120000 + 90000; // every 90-210s
      specialTimerRef.current = setTimeout(() => {
        // If sleeping, don't do anything - just reschedule
        if (isSleepingRef.current) {
          scheduleSpecial();
          return;
        }

        const timeSinceInteraction = Date.now() - lastInteractionRef.current;
        const roll = Math.random() * 100;

        // ---- Secret spin: 3% (roll 0-3) ----
        if (roll < 3) {
          setSpecialAnim("secret");
          setTimeout(() => setSpecialAnim(null), 2200);

        // ---- Sleep: 3% (roll 3-6), only if idle >15 min ----
        } else if (roll < 6) {
          if (timeSinceInteraction > 900000) {
            setSpecialAnim("sleep");
          }
          // If not idle enough, effectively "nothing happens"

        // ---- Fly attempt: 20% (roll 6-26) ----
        } else if (roll < 26) {
          setSpecialAnim("flyAttempt");
          setTimeout(() => {
            setSpecialAnim(null);
            showMessage(pickRandom(MESSAGES.flyFail));
          }, 1600);

        // ---- Bug chase: 25% (roll 26-51) ----
        } else if (roll < 51) {
          const targetBug = Math.floor(Math.random() * 5);
          setChasedBugId(targetBug);
          setSpecialAnim("chaseBug");
          showMessage(pickRandom([
            "*eyes lock onto bug*", "...i see you.", "TARGET ACQUIRED",
            "*pupils dilate*", "don't move don't move don't move",
            "*predator mode activated*", "hoo... hoo...",
          ]));
          setTimeout(() => {
            setChasedBugId(null);
            setSpecialAnim(null);
            // 60% catch, 40% miss
            if (Math.random() < 0.6) {
              showMessage(pickRandom([
                "*got it!!*", "*CRUNCH* ...delicious", "hehe gotcha",
                "*triumphant wing flap*", "too slow, little bug!",
                "i'm a predator. a tiny glowing predator. fear me.",
              ]));
            } else {
              showMessage(pickRandom([
                "...it got away", "*dejected hoot*", "next time.",
                "i wasn't even trying. (i was.)", "that bug is too fast and i respect it",
                "what if they have a family. what am i doing.",
              ]));
            }
          }, 3000);

        // ---- Discovery: 30% (roll 51-81) ----
        } else if (roll < 81) {
          showMessage(pickRandom(DISCOVERIES));

        // ---- Nothing: 19% (roll 81-100) ----
        }

        scheduleSpecial();
      }, delay);
    };
    scheduleSpecial();
    return () => clearTimeout(specialTimerRef.current);
  }, []);

  // ---- Message system ----
  const showMessage = useCallback((text, wellness = false, msgType = null) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setMessage(text); setShowBubble(true); setIsWellness(wellness);
    setCurrentMsgType(msgType);
  }, []);

  // Show a message without waking Glim (for sleep talk)
  const showSleepMessage = useCallback((text) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setMessage(text); setShowBubble(true); setIsWellness(false);
    setCurrentMsgType("sleep");
  }, []);

  // Explicitly wake Glim
  const wakeUp = useCallback(() => {
    if (isSleepingRef.current) {
      setSpecialAnim(null);
      isSleepingRef.current = false;
    }
  }, []);

  const triggerHappy = useCallback(() => {
    if (happyTimer.current) clearTimeout(happyTimer.current);
    setIsHappy(true); happyTimer.current = setTimeout(() => setIsHappy(false), 2000);
  }, []);

  const pickUnique = useCallback((pool, lastRef) => {
    let p = pickRandom(pool), a = 0;
    while (p === lastRef.current && a < 5) { p = pickRandom(pool); a++; }
    lastRef.current = p; return p;
  }, []);

  // ---- Journal save ----
  const saveJournalEntry = useCallback((text) => {
    addJournalEntry({
      id: crypto.randomUUID(),
      text: text.trim(),
      prompt: journalPrompt,
      date: new Date().toISOString(),
    });
    setJournalText("");
    setJournalPrompt(pickRandom(JOURNAL_PROMPTS));
    triggerHappy();
    showMessage(pickRandom([
      "saved! your words matter.", "got it. that one's safe with me.",
      "journaled! look at you being reflective.", "*tucks your entry away carefully*",
      "written and stored. future-you will appreciate this.",
      "that was good. you should do this more often.",
      "entry saved. you're building a record of being alive. that's cool.",
    ]));
  }, [journalPrompt, addJournalEntry, setJournalText, setJournalPrompt, triggerHappy, showMessage]);

  // ---- Wellness timer ----
  useEffect(() => {
    if (wellnessTimer.current) clearTimeout(wellnessTimer.current);
    const baseMs = wellnessInterval * 60000;
    const jitter = baseMs * 0.3;
    const s = () => { wellnessTimer.current = setTimeout(() => {
      if (!isSleepingRef.current) {
        showMessage(pickUnique(MESSAGES.wellness, lastWellnessRef), true, "wellness");
      }
      s();
    }, baseMs + Math.random() * jitter); }; s();
    return () => clearTimeout(wellnessTimer.current);
  }, [showMessage, pickUnique, wellnessInterval]);

  // ---- Move reminder ----
  useEffect(() => {
    if (moveTimer.current) clearTimeout(moveTimer.current);
    const schedule = () => {
      moveTimer.current = setTimeout(() => {
        if (!isSleepingRef.current) {
          setMoveReminder(pickRandom(MOVE_REMINDERS));
        } else {
          schedule(); // try again later
        }
      }, moveInterval * 60000);
    };
    schedule();
    return () => clearTimeout(moveTimer.current);
  }, [moveInterval]);
  const dismissMove = useCallback(() => {
    wakeUp();
    setMoveReminder(null); triggerHappy(); showMessage(pickRandom(MOVE_DONE_RESPONSES));
    moveTimer.current = setTimeout(() => setMoveReminder(pickRandom(MOVE_REMINDERS)), moveInterval * 60000);
  }, [showMessage, triggerHappy, moveInterval, wakeUp]);

  // ---- Eyes reminder ----
  useEffect(() => {
    if (eyesTimer.current) clearTimeout(eyesTimer.current);
    const schedule = () => {
      eyesTimer.current = setTimeout(() => {
        if (!isSleepingRef.current) {
          setEyesReminder(pickRandom(EYES_REMINDERS));
        } else {
          schedule();
        }
      }, eyesInterval * 60000);
    };
    schedule();
    return () => clearTimeout(eyesTimer.current);
  }, [eyesInterval]);
  const dismissEyes = useCallback(() => {
    wakeUp();
    setEyesReminder(null); triggerHappy(); showMessage(pickRandom(EYES_DONE_RESPONSES));
    eyesTimer.current = setTimeout(() => setEyesReminder(pickRandom(EYES_REMINDERS)), eyesInterval * 60000);
  }, [showMessage, triggerHappy, eyesInterval, wakeUp]);

  // ---- Idle chatter ----
  useEffect(() => {
    const s = () => {
      const d = Math.random() * 25000 + 15000;
      idleTimer.current = setTimeout(() => {
        if (isSleepingRef.current) {
          showSleepMessage(pickRandom(MESSAGES.sleepTalk));
          s(); return;
        }
        const r = Math.random();
        if (r < 0.16) {
          triggerHappy();
          showMessage(pickUnique(MESSAGES.encouragement, lastEncouragementRef), false, "encouragement");
        } else if (r < 0.32) {
          showMessage(pickRandom(MINDFULNESS), false, "mindfulness");
        } else if (r < 0.37) {
          showMessage(pickRandom(JOURNAL_NUDGES), false, "journal");
        } else if (r < 0.45) {
          showMessage(pickRandom(SCIENCE_FACTS), false, "science");
        } else if (r < 0.65) {
          showMessage(pickRandom(MESSAGES.idle), false, "idle");
        } else {
          showMessage(pickRandom(MESSAGES[mood]), false, "time");
        }
        s();
      }, d);
    }; s();
    return () => clearTimeout(idleTimer.current);
  }, [mood, showMessage, showSleepMessage, triggerHappy, pickUnique]);

  // ---- Greeting ----
  useEffect(() => {
    const t = setTimeout(() => showMessage(pickRandom(MESSAGES[mood])), 1500);
    return () => clearTimeout(t);
  }, []);

  // ---- Click handling with rapid detection and startle ----
  const handleClick = (e) => {
    // Prevent double-click from also firing single click messages
    if (e.detail > 1) return;
    // Prevent click from firing after a drag release
    if (justDraggedRef.current) return;
    // Prevent click during purr (mouseup handles purr end)
    if (isPurring) return;

    lastInteractionRef.current = Date.now();

    // Wake up if sleeping
    if (specialAnim === "sleep") {
      setSpecialAnim(null);
      setIsPuffed(true);
      showMessage(pickRandom(MESSAGES.startled));
      if (puffTimerRef.current) clearTimeout(puffTimerRef.current);
      puffTimerRef.current = setTimeout(() => setIsPuffed(false), 1500);
      return;
    }

    setSqueezed(true);
    setClickCount();
    setTimeout(() => setSqueezed(false), 280);

    // Track rapid clicks
    const now = Date.now();
    clickTimesRef.current.push(now);
    clickTimesRef.current = clickTimesRef.current.filter((t) => now - t < 2000);

    // Check if startled (first click after >5 min idle, 50% chance)
    const timeSinceLast = now - (clickTimesRef.current[clickTimesRef.current.length - 2] || 0);
    if (clickTimesRef.current.length === 1 && timeSinceLast > 300000 && Math.random() < 0.5) {
      setIsPuffed(true);
      showMessage(pickRandom(MESSAGES.startled));
      if (puffTimerRef.current) clearTimeout(puffTimerRef.current);
      puffTimerRef.current = setTimeout(() => setIsPuffed(false), 1500);
      return;
    }

    // Rapid clicking (4+ clicks in 2s)
    if (clickTimesRef.current.length >= 4) {
      showMessage(pickRandom(MESSAGES.rapidClick));
      return;
    }

    // Context-aware clicking (if a mindfulness message is showing)
    if (currentMsgType === "mindfulness") {
      showMessage(pickRandom(MESSAGES.mindfulClick));
      return;
    }

    // Normal click
    const r = Math.random();
    if (r < 0.15) {
      triggerHappy();
      showMessage(pickUnique(MESSAGES.encouragement, lastEncouragementRef), false, "encouragement");
    } else if (r < 0.25) {
      showMessage(pickRandom(MESSAGES[mood]));
    } else {
      showMessage(pickRandom(MESSAGES.clicked));
    }
  };

  // ---- Double-click: fly attempt ----
  const handleDoubleClick = () => {
    if (justDraggedRef.current) return;
    lastInteractionRef.current = Date.now();
    if (specialAnim) return;
    setSpecialAnim("flyAttempt");
    setTimeout(() => {
      setSpecialAnim(null);
      showMessage(pickRandom(MESSAGES.flyFail));
    }, 1600);
  };

  // ---- Interaction: drag, purr, click all unified ----
  const handleCreatureMouseDown = (e) => {
    e.preventDefault();
    lastInteractionRef.current = Date.now();
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    // Start purr timer (cancelled if drag starts)
    holdTimerRef.current = setTimeout(() => {
      if (dragStartRef.current && !dragStartRef.current.moved) {
        setIsPurring(true);
        showMessage(pickRandom(MESSAGES.purr));
      }
    }, 500);
  };

  // Window-level move/up handles ALL drag logic
  useEffect(() => {
    const onMove = (e) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      // Threshold before drag activates
      if (!dragStartRef.current.moved && Math.sqrt(dx * dx + dy * dy) > 10) {
        dragStartRef.current.moved = true;
        setIsDragging(true);
        setIsWandering(false);
        clearTimeout(wanderDriftRef.current);
        setIsPurring(false);
        clearTimeout(holdTimerRef.current);
      }
      if (dragStartRef.current.moved) {
        setDragPos({ x: dx, y: dy });
        // Track velocity for shake detection
        const now = Date.now();
        dragVelocityRef.current.push({ x: e.clientX, y: e.clientY, t: now });
        // Keep only last 500ms of movement
        dragVelocityRef.current = dragVelocityRef.current.filter((p) => now - p.t < 500);
        // Detect shake: 4+ direction changes in 500ms
        if (dragVelocityRef.current.length >= 4) {
          let dirChanges = 0;
          for (let i = 2; i < dragVelocityRef.current.length; i++) {
            const prevDx = dragVelocityRef.current[i-1].x - dragVelocityRef.current[i-2].x;
            const currDx = dragVelocityRef.current[i].x - dragVelocityRef.current[i-1].x;
            if ((prevDx > 0 && currDx < 0) || (prevDx < 0 && currDx > 0)) dirChanges++;
          }
          if (dirChanges >= 3 && !isShaken) {
            setIsShaken(true);
            showMessage(pickRandom(MESSAGES.shaken));
            if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
            shakeTimerRef.current = setTimeout(() => setIsShaken(false), 2000);
            dragVelocityRef.current = [];
          }
        }
      }
    };

    const onUp = () => {
      if (!dragStartRef.current) return;
      clearTimeout(holdTimerRef.current);

      if (dragStartRef.current.moved) {
        // Was dragging - end drag with drift back
        setIsDragging(false);
        setIsReturning(true);
        justDraggedRef.current = true;
        dragVelocityRef.current = [];
        setTimeout(() => { justDraggedRef.current = false; }, 300);

        if (Math.random() < 0.6) {
          showMessage(pickRandom([
            "wheee!", "*drifts home*", "okay okay i'm going back",
            "that was fun. do it again.", "i can find my way home. probably.",
            "*floats back contentedly*", "you can't get rid of me that easy",
            "weeeee... *thud*", "i belong in the middle and i know it",
          ]));
        }
        // Wait one frame for transition to apply, THEN move to center
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDragPos({ x: 0, y: 0 });
          });
        });
        // isReturning cleared after animation (safe - transition no longer changes on clear)
        setTimeout(() => setIsReturning(false), 3200);
      } else {
        // Was NOT dragging - stop purr if active
        if (isPurring) setIsPurring(false);
      }

      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPurring, isShaken, showMessage]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        fontFamily: "'Courier New', monospace",
        background: "#040408",
      }}>
      <Background hue={hue} sat={sat} mood={mood} />

      <div className="absolute rounded-full pointer-events-none" style={{
        width: 420, height: 420,
        border: `1px solid hsla(${hue}, ${sat}%, 55%, 0.07)`,
        animation: "ringPulse 6s ease-in-out infinite",
      }} />

      <AmbientBugs hue={hue} chasedBugId={chasedBugId} />

      <div className="relative" style={{
        zIndex: 10,
        transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
        transition: isDragging ? "none" : "transform 3s cubic-bezier(0.15, 0.6, 0.35, 1)",
        animation: !isDragging && !isReturning ? (
          specialAnim === "chaseBug" ? "creatureChase 3s ease-in-out"
          : specialAnim === "flyAttempt" ? "creatureFly 1.5s ease-in-out"
          : "none"
        ) : "none",
        cursor: isDragging ? "grabbing" : "grab",
      }} ref={creatureRef} onMouseDown={handleCreatureMouseDown}>
        <SpeechBubble text={message} visible={showBubble} isWellness={isWellness} />
        <OwlMoth
          onClick={handleClick} onDoubleClick={handleDoubleClick}
          squeezed={squeezed} hue={hue} sat={sat} mood={mood}
          isHappy={isHappy} isPuffed={isPuffed}
          isPurring={isPurring} isBlinking={isBlinking} specialAnim={specialAnim}
          antennaPerk={antennaPerk} wingTwitchSide={wingTwitchSide}
          pupilOffset={pupilOffset}
        />
      </div>

      <div className="mt-1 text-center relative" style={{ zIndex: 10 }}>
        <div style={{
          color: `hsla(${hue}, ${sat}%, 75%, 0.8)`, fontSize: 14,
          letterSpacing: "3px", textTransform: "uppercase",
        }}>glim</div>
        <div style={{
          color: `hsla(${hue}, ${sat - 15}%, 55%, 0.4)`, fontSize: 10, marginTop: 3, letterSpacing: "1px",
        }}>
          click to say hi{clickCount > 0 && ` · poked ${clickCount} time${clickCount > 1 ? "s" : ""}`}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={() => {
            wakeUp();
            lastInteractionRef.current = Date.now();
            clearTimeout(moveTimer.current);
            setMoveReminder(null);
            moveTimer.current = setTimeout(() => setMoveReminder(pickRandom(MOVE_REMINDERS)), moveInterval * 60000);
            showMessage(pickRandom(["nice! timer reset.", "got it, you moved!", "noted. clock restarted."]));
          }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`, fontSize: 10,
            fontFamily: "'Courier New', monospace", letterSpacing: "0.5px",
            transition: "color 0.2s ease", padding: "2px 6px",
          }}
            onMouseEnter={(e) => { e.target.style.color = `hsla(${hue}, ${sat}%, 70%, 0.7)`; }}
            onMouseLeave={(e) => { e.target.style.color = `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`; }}
          >just moved</button>
          <button onClick={() => {
            wakeUp();
            lastInteractionRef.current = Date.now();
            clearTimeout(eyesTimer.current);
            setEyesReminder(null);
            eyesTimer.current = setTimeout(() => setEyesReminder(pickRandom(EYES_REMINDERS)), eyesInterval * 60000);
            showMessage(pickRandom(["good! eye timer reset.", "eyes rested! clock restarted.", "noted. see you in a bit."]));
          }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`, fontSize: 10,
            fontFamily: "'Courier New', monospace", letterSpacing: "0.5px",
            transition: "color 0.2s ease", padding: "2px 6px",
          }}
            onMouseEnter={(e) => { e.target.style.color = `hsla(${hue}, ${sat}%, 70%, 0.7)`; }}
            onMouseLeave={(e) => { e.target.style.color = `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`; }}
          >eyes rested</button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-5 relative" style={{ minHeight: 20, zIndex: 10 }}>
        {eyesReminder && <PersistentReminder text={eyesReminder} type="eyes" onDismiss={dismissEyes} />}
        {moveReminder && <PersistentReminder text={moveReminder} type="move" onDismiss={dismissMove} />}
      </div>

      <SettingsPanel />
      <JournalPanel onSave={saveJournalEntry} />
    </div>
  );
}
