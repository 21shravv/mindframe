const app = document.getElementById("app");

const puzzles = [
  { type: "text", q: "What comes next: A1, B2, C3, D4, ?", a: "E5", hint: "Letter goes up by 1, number goes up by 1." },
  { type: "text", q: "Odd one out: 2, 3, 5, 9, 11", a: "9", hint: "All others are prime." },
  { type: "text", q: "If TODAY is coded as UPEBZ, what is CODE coded as?", a: "DPEF", hint: "Each letter shifts +1 in alphabet." },
  { type: "text", q: "Mental math: (18 ÷ 3) + (7 × 2) = ?", a: "20", hint: "Do division then multiplication." },
  { type: "text", q: "Mental math: 15% of 80 = ?", a: "12", hint: "10% of 80 is 8, 5% is 4." },
  { type: "text", q: "Rearrange the letters: 'LISTEN' to form a related word.", a: "SILENT", hint: "Same letters, different meaning." },
  { type: "text", q: "Spot the pattern: 1, 1, 2, 3, 5, 8, ?", a: "13", hint: "Each term is the sum of the previous two." }
];

let puzzleSession = {
  selected: [],
  current: 0,
  score: 0  
};

let lastPuzzleScore = null;
let puzzleTries = 0;

let pomodoroState = {
  mode: "focus",
  isRunning: false,
  isPaused: false,
  focusSeconds: 25 * 60,
  breakSeconds: 5 * 60,
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  endTime: null,
  intervalId: null
};

let mindfulnessState = {
  seconds: 60,
  remaining: 60,
  endTime: null,
  intervalId: null,
  isRunning: false
};

let breatheState = {
  totalCycles: 5,
  currentCycle: 1,
  intervalId: null,
  timeoutId: null,
  active: false
};

function stopAllActivities() {
  cancelPomodoroSession();
  cancelMindfulnessSession();
  cancelBreatheSession();
}

function Home() {
  stopAllActivities();
  app.innerHTML = `
    <div class="home-wrapper">
      <h1>What would you like to do today?</h1>
      <div class="main-grid">
        <button class="main-btn" onclick="FocusMode()">
          <h2>Focus Mode</h2>
        </button>

        <button class="main-btn" onclick="BreatheMode()">
          <h2>Breathe Mode</h2>
        </button>

        <button class="main-btn" onclick="CoolMode()">
          <h2>Cool Mode</h2>
        </button>
      </div>
    </div>
  `;
}

function About() {
  stopAllActivities();
  app.innerHTML = `
    <div class="home-wrapper">
      <h1>About</h1>
      <div class="info-card">
        <p>MindFrame is a student-designed wellbeing website that helps athletes and students manage focus, breathing, and recovery through short guided activities.</p>
        <p>It includes cognitive focus tasks, breathing exercises, and post-performance reflection tools to support mental regulation in a simple and accessible way.</p>
      </div>
      <button class="back-btn" onclick="Home()">Back</button>
    </div>
  `;
}

function Contact() {
  stopAllActivities();
  app.innerHTML = `
    <div class="home-wrapper">
      <h1>Contact</h1>
      <div class="info-card">
        <p>Creator: Shravan Srikumar</p>
        <p>School email: shravans2028@misp.org</p>
        <p>Personal email: mr.shravan.srikumar@gmail.com</p>
      </div>
      <button class="back-btn" onclick="Home()">Back</button>
    </div>
  `;
}

function FocusMode() {
  stopAllActivities();
  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Focus Mode</h1>
        <div class="main-grid">
          <button class="main-btn" onclick="Puzzle()">
            <h2>Puzzle</h2>
          </button>

          <button class="main-btn" onclick="Pomodoro()">
            <h2>Pomodoro Technique</h2>
          </button>
          
          <button class="main-btn" onclick="Mindfulness()">
            <h2>Mindfulness Focus</h2>
          </button>
        </div>
      </div>
      <button class="back-btn" onclick="Home()">Back</button>
    </div>
  `;
}

function Puzzle() {
  stopAllActivities();
  startPuzzleSession();
}

function startPuzzleSession() {
  const picks = new Set();
  while (picks.size < 3) {
    picks.add(Math.floor(Math.random() * puzzles.length));
  }

  puzzleSession.selected = [...picks];
  puzzleSession.current = 0;
  puzzleSession.score = 0;

  renderPuzzleRound();
}

function renderPuzzleRound() {
  puzzleTries = 0;

  const roundNum = puzzleSession.current + 1;
  const idx = puzzleSession.selected[puzzleSession.current];
  const p = puzzles[idx];

  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Puzzle (${roundNum}/3)</h1>

        <div class="puzzle-card">
          <p class="puzzle-q">${p.q}</p>

          <input id="answerInput" class="puzzle-input" placeholder="Type your answer..." />
          
          <div class="puzzle-row">
            <button class="main-btn small-btn" id="checkBtn">Check</button>
            <button class="back-btn" id="hintBtn">Hint</button>
          </div>

          <p id="feedback" class="puzzle-feedback"></p>
        </div>
      </div>

      <button class="back-btn" onclick="FocusMode()">Back to Focus Mode</button>
    </div>
  `;

  document.getElementById("checkBtn").onclick = () => checkPuzzleAnswer(idx);
  document.getElementById("hintBtn").onclick = () => showPuzzleHint(idx);

  document.getElementById("answerInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      checkPuzzleAnswer(idx);
    }
  });
}

function normalise(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, "");
}

function checkPuzzleAnswer(puzzleIndex) {
  const userRaw = document.getElementById("answerInput").value;
  const correctRaw = puzzles[puzzleIndex].a;

  const user = normalise(userRaw);
  const correct = normalise(correctRaw);

  const feedback = document.getElementById("feedback");

  if (user === correct) {
    puzzleSession.score += 1;
    feedback.textContent = "✅ Correct!";
    setTimeout(() => {
      puzzleSession.current += 1;
      if (puzzleSession.current >= 3) {
        finishPuzzleSession();
      } else {
        renderPuzzleRound();
      }
    }, 700);
  } else {
    puzzleTries += 1;

    if (puzzleTries === 1) {
      feedback.textContent = "❌ Incorrect. You have 1 try left.";
      document.getElementById("answerInput").value = "";
    } else {
      feedback.textContent = `❌ Incorrect. The correct answer was: ${correctRaw}`;
      setTimeout(() => {
        puzzleSession.current += 1;
        if (puzzleSession.current >= 3) {
          finishPuzzleSession();
        } else {
          renderPuzzleRound();
        }
      }, 1200);
    }
  }
}

function showPuzzleHint(puzzleIndex) {
  document.getElementById("feedback").textContent = "Hint: " + puzzles[puzzleIndex].hint;
}

function finishPuzzleSession() {
  lastPuzzleScore = puzzleSession.score;

  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Session Complete</h1>
        <div class="puzzle-card">
          <p class="puzzle-q">Your score: <strong>${puzzleSession.score}/3</strong></p>
          <p class="puzzle-feedback">Head to Reflection to log how your focus felt.</p>

          <div class="puzzle-row">
            <button class="main-btn small-btn" onclick="FocusReflection()">Go to Reflection</button>
            <button class="back-btn" onclick="startPuzzleSession()">Try another set</button>
          </div>
        </div>
      </div>

      <button class="back-btn" onclick="FocusMode()">Back to Focus Mode</button>
    </div>
  `;
}

function FocusReflection() {
  stopAllActivities();
  const scoreText = (lastPuzzleScore === null)
    ? "Puzzle score today: not attempted yet."
    : `Puzzle score today: ${lastPuzzleScore}/3`;

  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Reflection (Focus Mode)</h1>

        <div class="puzzle-card">
          <p class="puzzle-q">${scoreText}</p>

          <p>1) What distracted you most?</p>
          <input class="puzzle-input" placeholder="Type here..." />

          <p style="margin-top:16px;">2) What helped you focus?</p>
          <input class="puzzle-input" placeholder="Type here..." />

          <p style="margin-top:16px;">3) Rate your focus (1–10)</p>
          <input class="puzzle-input" placeholder="1–10" />

          <div class="puzzle-row" style="margin-top:18px;">
            <button class="main-btn small-btn" onclick="FocusMode()">Done</button>
          </div>
        </div>
      </div>

      <button class="back-btn" onclick="FocusMode()">Back to Focus Mode</button>
    </div>
  `;
}

function clearPomodoroTimer() {
  if (pomodoroState.intervalId) {
    clearInterval(pomodoroState.intervalId);
    pomodoroState.intervalId = null;
  }
}

function cancelPomodoroSession() {
  clearPomodoroTimer();
  pomodoroState.isRunning = false;
  pomodoroState.isPaused = false;
  pomodoroState.endTime = null;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function resetPomodoroDurations(focusSecs, breakSecs) {
  cancelPomodoroSession();
  pomodoroState.mode = "focus";
  pomodoroState.focusSeconds = focusSecs;
  pomodoroState.breakSeconds = breakSecs;
  pomodoroState.totalSeconds = focusSecs;
  pomodoroState.remainingSeconds = focusSecs;
}

function Pomodoro() {
  cancelMindfulnessSession();
  cancelBreatheSession();

  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Pomodoro Technique</h1>

        <div class="pomodoro-card">
          <h2 id="sessionLabel">Focus Session</h2>
          <p id="sessionType">Choose a session length:</p>

          <div class="pomodoro-row">
            <button class="main-btn small-btn" id="setClassicBtn">25 / 5</button>
            <button class="main-btn small-btn" id="setShortBtn">10 / 2</button>
          </div>

          <div class="timer-display" id="timerDisplay">25:00</div>

          <div class="pomodoro-row">
            <button class="main-btn small-btn" id="startBtn">Start</button>
            <button class="main-btn small-btn" id="pauseBtn">Pause</button>
            <button class="main-btn small-btn" id="resetBtn">Reset</button>
          </div>

          <div class="pomodoro-row">
            <button class="back-btn" id="endSessionBtn">End Session</button>
            <button class="back-btn" id="skipBreakBtn" style="display:none;">Skip Break</button>
          </div>

          <p id="pomodoroMessage" class="pomodoro-message"></p>

          <div id="breakPrompt" class="break-prompt" style="display:none;">
            <p>Focus session complete. Start break?</p>
            <div class="pomodoro-row">
              <button class="main-btn small-btn" id="startBreakBtn">Start Break</button>
              <button class="back-btn" id="endAfterFocusBtn">End Session</button>
            </div>
          </div>
        </div>
      </div>

      <button class="back-btn" onclick="FocusMode()">Back</button>
    </div>
  `;

  const timerDisplay = document.getElementById("timerDisplay");
  const sessionLabel = document.getElementById("sessionLabel");
  const sessionType = document.getElementById("sessionType");
  const pomodoroMessage = document.getElementById("pomodoroMessage");
  const breakPrompt = document.getElementById("breakPrompt");
  const skipBreakBtn = document.getElementById("skipBreakBtn");

  function updatePomodoroUI() {
    timerDisplay.textContent = formatTime(pomodoroState.remainingSeconds);

    if (pomodoroState.mode === "focus") {
      sessionLabel.textContent = "Focus Session";
      sessionType.textContent = `Focus: ${Math.floor(pomodoroState.focusSeconds / 60)} min | Break: ${Math.floor(pomodoroState.breakSeconds / 60)} min`;
      skipBreakBtn.style.display = "none";
    } else {
      sessionLabel.textContent = "Break Session";
      sessionType.textContent = `Break time: ${Math.floor(pomodoroState.breakSeconds / 60)} min`;
      skipBreakBtn.style.display = "inline-block";
    }
  }

  function tickPomodoro() {
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((pomodoroState.endTime - now) / 1000));
    pomodoroState.remainingSeconds = diff;
    updatePomodoroUI();

    if (diff <= 0) {
      clearPomodoroTimer();
      pomodoroState.isRunning = false;
      pomodoroState.endTime = null;

      if (pomodoroState.mode === "focus") {
        pomodoroMessage.textContent = "Nice. Your focus session is complete.";
        breakPrompt.style.display = "block";
      } else {
        pomodoroMessage.textContent = "Break complete. Well done.";
      }
    }
  }

  function startPomodoro() {
    if (pomodoroState.isRunning) return;

    breakPrompt.style.display = "none";
    pomodoroMessage.textContent = "";

    pomodoroState.isRunning = true;
    pomodoroState.isPaused = false;
    pomodoroState.endTime = Date.now() + pomodoroState.remainingSeconds * 1000;

    clearPomodoroTimer();
    pomodoroState.intervalId = setInterval(tickPomodoro, 1000);
    tickPomodoro();
  }

  function pausePomodoro() {
    if (!pomodoroState.isRunning) return;

    clearPomodoroTimer();
    pomodoroState.isRunning = false;
    pomodoroState.isPaused = true;
    pomodoroMessage.textContent = "Timer paused.";
  }

  function resetPomodoro() {
    clearPomodoroTimer();
    pomodoroState.isRunning = false;
    pomodoroState.isPaused = false;
    pomodoroState.endTime = null;
    pomodoroState.mode = "focus";
    pomodoroState.remainingSeconds = pomodoroState.focusSeconds;
    pomodoroMessage.textContent = "";
    breakPrompt.style.display = "none";
    updatePomodoroUI();
  }

  function startBreak() {
    clearPomodoroTimer();
    pomodoroState.mode = "break";
    pomodoroState.isRunning = false;
    pomodoroState.isPaused = false;
    pomodoroState.endTime = null;
    pomodoroState.remainingSeconds = pomodoroState.breakSeconds;
    breakPrompt.style.display = "none";
    pomodoroMessage.textContent = "";
    updatePomodoroUI();
    startPomodoro();
  }

  function endPomodoroSession() {
    cancelPomodoroSession();
    resetPomodoroDurations(pomodoroState.focusSeconds, pomodoroState.breakSeconds);
    Pomodoro();
  }

  function skipBreak() {
    cancelPomodoroSession();
    pomodoroState.mode = "focus";
    pomodoroState.remainingSeconds = pomodoroState.focusSeconds;
    pomodoroMessage.textContent = "Break skipped.";
    updatePomodoroUI();
  }

  document.getElementById("setClassicBtn").onclick = () => {
    resetPomodoroDurations(25 * 60, 5 * 60);
    pomodoroMessage.textContent = "";
    breakPrompt.style.display = "none";
    updatePomodoroUI();
  };

  document.getElementById("setShortBtn").onclick = () => {
    resetPomodoroDurations(10 * 60, 2 * 60);
    pomodoroMessage.textContent = "";
    breakPrompt.style.display = "none";
    updatePomodoroUI();
  };

  document.getElementById("startBtn").onclick = startPomodoro;
  document.getElementById("pauseBtn").onclick = pausePomodoro;
  document.getElementById("resetBtn").onclick = resetPomodoro;
  document.getElementById("endSessionBtn").onclick = endPomodoroSession;
  document.getElementById("startBreakBtn").onclick = startBreak;
  document.getElementById("endAfterFocusBtn").onclick = endPomodoroSession;
  document.getElementById("skipBreakBtn").onclick = skipBreak;

  updatePomodoroUI();
}

function clearMindfulnessTimer() {
  if (mindfulnessState.intervalId) {
    clearInterval(mindfulnessState.intervalId);
    mindfulnessState.intervalId = null;
  }
}

function cancelMindfulnessSession() {
  clearMindfulnessTimer();
  mindfulnessState.isRunning = false;
  mindfulnessState.endTime = null;
}

function Mindfulness() {
  cancelPomodoroSession();
  cancelBreatheSession();

  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Mindfulness Focus</h1>

        <div class="pomodoro-card">
          <h2>Train Your Attention</h2>
          <p>Choose a short session. Focus on the dot, breathe naturally, and gently bring your attention back whenever your mind wanders.</p>

          <div class="pomodoro-row">
            <button class="main-btn small-btn" id="m1">1 min</button>
            <button class="main-btn small-btn" id="m2">2 min</button>
            <button class="main-btn small-btn" id="m3">3 min</button>
          </div>

          <div class="mindfulness-dot" id="mindfulnessDot"></div>
          <div class="timer-display" id="mindfulnessDisplay">01:00</div>

          <div class="pomodoro-row">
            <button class="main-btn small-btn" id="mindStart">Start</button>
            <button class="main-btn small-btn" id="mindPause">Pause</button>
            <button class="main-btn small-btn" id="mindReset">Reset</button>
          </div>

          <p id="mindMsg" class="pomodoro-message"></p>
        </div>
      </div>

      <button class="back-btn" onclick="FocusMode()">Back</button>
    </div>
  `;

  const display = document.getElementById("mindfulnessDisplay");
  const msg = document.getElementById("mindMsg");

  function updateMindfulnessUI() {
    display.textContent = formatTime(mindfulnessState.remaining);
  }

  function tickMindfulness() {
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((mindfulnessState.endTime - now) / 1000));
    mindfulnessState.remaining = diff;
    updateMindfulnessUI();

    if (diff <= 0) {
      clearMindfulnessTimer();
      mindfulnessState.isRunning = false;
      mindfulnessState.endTime = null;
      msg.textContent = "Session complete. Nice work bringing your attention back.";
    }
  }

  function startMindfulness() {
    if (mindfulnessState.isRunning) return;
    msg.textContent = "";
    mindfulnessState.isRunning = true;
    mindfulnessState.endTime = Date.now() + mindfulnessState.remaining * 1000;
    clearMindfulnessTimer();
    mindfulnessState.intervalId = setInterval(tickMindfulness, 1000);
    tickMindfulness();
  }

  function pauseMindfulness() {
    if (!mindfulnessState.isRunning) return;
    clearMindfulnessTimer();
    mindfulnessState.isRunning = false;
    msg.textContent = "Session paused.";
  }

  function resetMindfulness() {
    clearMindfulnessTimer();
    mindfulnessState.isRunning = false;
    mindfulnessState.endTime = null;
    mindfulnessState.remaining = mindfulnessState.seconds;
    msg.textContent = "";
    updateMindfulnessUI();
  }

  document.getElementById("m1").onclick = () => {
    cancelMindfulnessSession();
    mindfulnessState.seconds = 60;
    mindfulnessState.remaining = 60;
    msg.textContent = "";
    updateMindfulnessUI();
  };

  document.getElementById("m2").onclick = () => {
    cancelMindfulnessSession();
    mindfulnessState.seconds = 120;
    mindfulnessState.remaining = 120;
    msg.textContent = "";
    updateMindfulnessUI();
  };

  document.getElementById("m3").onclick = () => {
    cancelMindfulnessSession();
    mindfulnessState.seconds = 180;
    mindfulnessState.remaining = 180;
    msg.textContent = "";
    updateMindfulnessUI();
  };

  document.getElementById("mindStart").onclick = startMindfulness;
  document.getElementById("mindPause").onclick = pauseMindfulness;
  document.getElementById("mindReset").onclick = resetMindfulness;

  updateMindfulnessUI();
}

function BreatheMode() {
  stopAllActivities();
  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Breathe Mode</h1>
        <div class="main-grid">
          <button class="main-btn" onclick="Bhramari()">
            <h2>Bhramari Pranayam</h2>
          </button>

          <button class="main-btn" onclick="Lion()">
            <h2>Lion's Breath</h2>
          </button>

          <button class="main-btn" onclick="Box()">
            <h2>Box Breathing</h2>
          </button>
        </div>
      </div>
      <button class="back-btn" onclick="Home()">Back</button>
    </div>
  `;
}

function cancelBreatheSession() {
  if (breatheState.intervalId) {
    clearInterval(breatheState.intervalId);
    breatheState.intervalId = null;
  }
  if (breatheState.timeoutId) {
    clearTimeout(breatheState.timeoutId);
    breatheState.timeoutId = null;
  }
  breatheState.active = false;
}

function runBreathingActivity(title, steps, backFnName) {
  cancelPomodoroSession();
  cancelMindfulnessSession();
  cancelBreatheSession();

  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>${title}</h1>

        <div class="pomodoro-card">
          <h2 id="breathStepTitle">Press Start</h2>
          <p id="breathStepText">Follow the guided breathing steps on screen.</p>
          <div class="timer-display" id="breathCountdown">00</div>

          <div class="pomodoro-row">
            <button class="main-btn small-btn" id="breathStart">Start</button>
            <button class="main-btn small-btn" id="breathReset">Reset</button>
          </div>

          <p id="breathMessage" class="pomodoro-message"></p>
        </div>
      </div>

      <button class="back-btn" onclick="${backFnName}()">Back</button>
    </div>
  `;

  const stepTitle = document.getElementById("breathStepTitle");
  const stepText = document.getElementById("breathStepText");
  const countdown = document.getElementById("breathCountdown");
  const message = document.getElementById("breathMessage");

  function resetBreathingUI() {
    cancelBreatheSession();
    breatheState.currentCycle = 1;
    stepTitle.textContent = "Press Start";
    stepText.textContent = "Follow the guided breathing steps on screen.";
    countdown.textContent = "00";
    message.textContent = "";
  }

  function runStep(stepIndex) {
    if (!breatheState.active) return;

    const step = steps[stepIndex];
    let remaining = step.seconds;

    stepTitle.textContent = `Cycle ${breatheState.currentCycle} / ${breatheState.totalCycles}`;
    stepText.textContent = step.label;
    countdown.textContent = String(remaining).padStart(2, "0");

    breatheState.intervalId = setInterval(() => {
      remaining -= 1;
      countdown.textContent = String(Math.max(remaining, 0)).padStart(2, "0");

      if (remaining <= 0) {
        clearInterval(breatheState.intervalId);
        breatheState.intervalId = null;

        if (stepIndex < steps.length - 1) {
          runStep(stepIndex + 1);
        } else {
          if (breatheState.currentCycle < breatheState.totalCycles) {
            breatheState.currentCycle += 1;
            runStep(0);
          } else {
            breatheState.active = false;
            stepTitle.textContent = "Complete";
            stepText.textContent = "Well done. Notice how your body feels now.";
            countdown.textContent = "00";
            message.textContent = "Breathing session complete.";
          }
        }
      }
    }, 1000);
  }

  document.getElementById("breathStart").onclick = () => {
    resetBreathingUI();
    breatheState.active = true;
    runStep(0);
  };

  document.getElementById("breathReset").onclick = resetBreathingUI;
}

function Bhramari() {
  runBreathingActivity(
    "Bhramari Pranayam",
    [
      { label: "Inhale gently through your nose", seconds: 4 },
      { label: "Exhale slowly with a humming sound", seconds: 6 }
    ],
    "BreatheMode"
  );
}

function Lion() {
  runBreathingActivity(
    "Lion's Breath",
    [
      { label: "Inhale deeply through your nose", seconds: 4 },
      { label: "Exhale strongly through your mouth", seconds: 5 }
    ],
    "BreatheMode"
  );
}

function Box() {
  runBreathingActivity(
    "Box Breathing",
    [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 }
    ],
    "BreatheMode"
  );
}

function CoolMode() {
  stopAllActivities();
  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Cool Mode</h1>
        <div class="main-grid">
          <button class="main-btn" onclick="Zumba()">
            <h2>Zumba</h2>
          </button>

          <button class="main-btn" onclick="Visual()">
            <h2>Visual Relaxation</h2>
          </button>

          <button class="main-btn" onclick="Post()">
            <h2>Post-Performance Reflection</h2>
          </button>
        </div>
      </div>
      <button class="back-btn" onclick="Home()">Back</button>
    </div>
  `;
}

function Zumba() {
  stopAllActivities();
  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Zumba</h1>
        <div class="pomodoro-card">
          <h2>Quick Movement Reset</h2>
          <p>Stand up and do this short sequence for 2 minutes:</p>
          <ul class="simple-list">
            <li>20 jumping jacks</li>
            <li>20 side steps</li>
            <li>20 arm swings</li>
            <li>20 high knees</li>
          </ul>
          <p class="pomodoro-message">Move with energy, then return when your body feels more awake.</p>
        </div>
      </div>
      <button class="back-btn" onclick="CoolMode()">Back</button>
    </div>
  `;
}

function Visual() {
  stopAllActivities();
  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Visual Relaxation</h1>
        <div class="pomodoro-card">
          <h2>Slow Down Your Eyes</h2>
          <div class="visual-box">
            <div class="visual-circle"></div>
          </div>
          <p>Watch the movement for one minute and let your breathing slow down naturally.</p>
        </div>
      </div>
      <button class="back-btn" onclick="CoolMode()">Back</button>
    </div>
  `;
}

function Post() {
  stopAllActivities();
  app.innerHTML = `
    <div class="screen-wrapper">
      <div class="screen-center">
        <h1>Post-Performance Reflection</h1>
        <div class="puzzle-card">
          <p>1) What went well today?</p>
          <input class="puzzle-input" placeholder="Type here..." />

          <p style="margin-top:16px;">2) What could you improve next time?</p>
          <input class="puzzle-input" placeholder="Type here..." />

          <p style="margin-top:16px;">3) One positive takeaway</p>
          <input class="puzzle-input" placeholder="Type here..." />

          <div class="puzzle-row" style="margin-top:18px;">
            <button class="main-btn small-btn" onclick="CoolMode()">Done</button>
          </div>
        </div>
      </div>
      <button class="back-btn" onclick="CoolMode()">Back</button>
    </div>
  `;
}

Home();