export default {
  async fetch(request, env, ctx) {
    
    const LOGO_URL = "https://young-wildflower-f50f.ffu270.workers.dev/Logo.png"; 
    const BG_URL = "https://young-wildflower-f50f.ffu270.workers.dev/background.png"; 

    const html = `
<!DOCTYPE html>
<html lang="my">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lucky Splash Wheel</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        body {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            height: 100vh; margin: 0; 
            background: url('${BG_URL}') no-repeat center center fixed;
            background-size: cover;
            font-family: 'Pyidaungsu', sans-serif; color: white; overflow: hidden;
            position: relative;
        }
        body::before {
            content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); z-index: 0;
        }

        h1 { margin-bottom: 100px; text-shadow: 2px 2px 10px rgba(0,0,0,0.8); color: #ffcc00; z-index: 1; font-size: clamp(1.5rem, 5vw, 2.5rem);
            text-align: center; }
        
        .wheel-container { position: relative; 
						   width: clamp(280px, 85vw, 380px); 
            			   height: clamp(280px, 85vw, 380px);
						   z-index: 1; }
        
        .pointer {
            position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
            width: 0; height: 0; border-left: clamp(15px, 4vw, 20px) solid transparent; 
            border-right: clamp(15px, 4vw, 20px) solid transparent;
            border-top: clamp(30px, 8vw, 40px) solid #ffcc00; z-index: 100;
        }
        
        .outer-glow {
            width: 100%; height: 100%; border-radius: 50%; border: 8px solid #d4af37;
            box-shadow: 0 0 30px #ff4500; display: flex; align-items: center; justify-content: center;
            background: #d4af37; position: relative;
        }

        canvas { 
            border-radius: 50%; 
            /* Transition ကို JS ထဲမှာ လိုအပ်မှ ထည့်ပါမယ် */
        }

        .center-logo {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 75px; height: 75px;
            background: white; border-radius: 50%;
            border: 4px solid #ffcc00; z-index: 10;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-shadow: 0 0 15px rgba(0,0,0,0.5);
        }
        .center-logo img { width: 100%; height: 100%; object-fit: contain; }

        .spin-btn {
            margin-top: 120px; padding: 15px 50px; font-size: clamp(18px, 4vw, 22px); font-weight: bold;
            color: #440000; background: linear-gradient(#ffea00, #ff9500);
            border: none; border-radius: 50px; cursor: pointer; 
            box-shadow: 0 6px 0 #b36b00; z-index: 1; transition: 0.2s;
			width: clamp(200px, 60vw, 300px);
        }
        .spin-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #b36b00; }
        .spin-btn:disabled { background: #666; box-shadow: 0 4px 0 #333; cursor: not-allowed; }

        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); display: none;
            justify-content: center; align-items: center; z-index: 1000;
        }
        .modal {
            background: #fff; color: #333; padding: 30px; border-radius: 20px;
            text-align: center; width: 85%; max-width: 320px;
            box-shadow: 0 10px 30px rgba(255, 204, 0, 0.3);
            transform: scale(0.7); opacity: 0; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .modal.active { transform: scale(1); opacity: 1; }
        .modal h2 { color: #d44737; margin-top: 0; font-size: 24px; }
        .modal p { font-size: 18px; margin: 15px 0; font-weight: bold; }
        .modal .prize-text { color: #b36b00; font-size: 20px; display: block; margin-top: 5px; }
        .close-btn {
            background: linear-gradient(#ffea00, #ff9500); border: none;
            padding: 10px 30px; font-size: 16px; font-weight: bold;
            border-radius: 25px; cursor: pointer; color: #440000;
            box-shadow: 0 4px 0 #b36b00; margin-top: 15px;
        }

		.bulb-ring {
			position: absolute;
			width: 105%;
			height: 105%;
			border-radius: 50%;
			pointer-events: none;
			transition: opacity 0.15s linear, background 0.2s;
		}

		.bulb {
			position: absolute;
			width: 12px;
			height: 12px;
			background: #fff;
			border-radius: 50%;
			box-shadow: 0 0 8px #fff, 0 0 15px #ffcc00;
			transition: 0.2s;
		}

		.bulb.off {
			background: #444;
			box-shadow: none;
		}

		#statsPanel {
			position: absolute;
			right: 20px;
			top: 20px;
			width: 260px;
			max-height: 80vh;
			overflow-y: auto;
			background: rgba(0,0,0,0.75);
			padding: 15px;
			border-radius: 12px;
			font-size: 14px;
			z-index: 2;
		}

		.stat-row {
			margin: 6px 0;
		}

		.stat-bar {
			height: 6px;
			background: #ffcc00;
			border-radius: 3px;
		}

		/* MOBILE OVERRIDES */
        @media (max-width: 900px) {
            #statsPanel {
                position: relative;
                right: auto; top: auto;
                width: 100%;
                max-width: 400px;
                margin-top: 40px;
                max-height: none;
            }
            body { justify-content: flex-start; padding-top: 40px; }
        }
    </style>
</head>
<body>

    <h1> Lucky Splash Wheel </h1>

    <div class="wheel-container">
        <div class="pointer"></div>
        <div class="outer-glow">
            <canvas id="wheelCanvas" width="400" height="400"></canvas>
			<div class="bulb-ring" id="bulbRing"></div>
            <div class="center-logo">
                <img src="${LOGO_URL}" alt="Logo">
            </div>
        </div>
    </div>

    <button class="spin-btn" id="spinBtn" onclick="spin(setInterval(animateBulbs, 100))">SPIN NOW</button>

    <div class="modal-overlay" id="modalOverlay">
        <div class="modal" id="modalBox">
            <h2>🎉 ဂုဏ်ယူပါတယ်! 🎉</h2>
            <p>သင်ရရှိတဲ့ဆုကတော့: <br>
               <span class="prize-text" id="prizeDisplay"></span>
            </p>
            <button class="close-btn" onclick="closeModal()"> Thank You </button>
        </div>
    </div>
	<div id="statsPanel">
		<h3>📊 Spin Analytics</h3>
		<div id="totalSpins">Total Spins: 0</div>
		<div id="statsList"></div>
	</div>

    <script>
        const canvas = document.getElementById("wheelCanvas");
        const ctx = canvas.getContext("2d");
        const spinBtn = document.getElementById("spinBtn");
        const modalOverlay = document.getElementById("modalOverlay");
        const modalBox = document.getElementById("modalBox");
        const prizeDisplay = document.getElementById("prizeDisplay");

		const sectors = [
            { label: "$50 Cashback", cat: "Grand Prize", color: "#d4af37", chance: 2 },
            { label: "$20 Cashback", cat: "Special Prize", color: "#e61919", chance: 3 },
            { label: "$10 Cashback", cat: "Daily Wins", color: "#ffcc00", chance: 5 },
            { label: "Free Earphones", cat: "Inventory Clear", color: "#e61919", chance: 15 },
            { label: "Free Case/Cable", cat: "Consolation", color: "#ffcc00", chance: 30 },
            { label: "$5 Voucher", cat: "Future Sales", color: "#e61919", chance: 15 },
            { label: "Powerbank", cat: "Inventory Clear", color: "#ffcc00", chance: 15 },
        ];

		const bulbRing = document.getElementById("bulbRing");
		const bulbCount = 40;
		let bulbState = false;
		let currentBulb = 0;

		let spinStats = {
			total: 0,
			counts: {}
		};

		sectors.forEach(s => {
			spinStats.counts[s.label] = 0;
		});

	function updateStatsUI() {
		document.getElementById("totalSpins").innerText = "Total Spins: " + spinStats.total;
		const container = document.getElementById("statsList");
		container.innerHTML = "";

		sectors.forEach(s => {
			const count = spinStats.counts[s.label];
			const percent = spinStats.total ? ((count / spinStats.total) * 100).toFixed(1) : 0;
			const row = document.createElement("div");
			row.className = "stat-row";
			
			// Securely wrapped for Worker string injection
			row.innerHTML = ' \
				<div style="display:flex; justify-content:space-between"> \
					<span>' + s.label + '</span> \
					<span style="color:#aaa">' + count + ' hits</span> \
				</div> \
				<div style="font-size:11px; color:#ffcc00">' + percent + '% (Target: ' + s.chance + '%)</div> \
				<div class="stat-bar" style="width:' + percent + '%"></div> \
			';
			container.appendChild(row);
		});
	}

	function createBulbs() {
		const bulbSize = 12;
		const center = canvas.width / 2;

		const radius = center + 8; // 🔥 pushes bulbs slightly OUTSIDE border

		for (let i = 0; i < bulbCount; i++) {
			const bulb = document.createElement("div");
			bulb.classList.add("bulb");

			const angle = (i / bulbCount) * 2 * Math.PI;

			const x = center + radius * Math.cos(angle) - bulbSize / 2;
			const y = center + radius * Math.sin(angle) - bulbSize / 2;

			bulb.style.left = x + "px";
			bulb.style.top = y + "px";

			bulbRing.appendChild(bulb);
		}
	}

	function enterFullscreen() {
		const elem = document.documentElement;

		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		}
	}

	function animateBulbs() {
		const bulbs = document.querySelectorAll(".bulb");

		bulbs.forEach((bulb, i) => {
			const diff = (i - currentBulb + bulbs.length) % bulbs.length;

			if (diff === 0) {
				bulb.classList.remove("off");
				bulb.style.opacity = "1";
			} else if (diff === 1) {
				bulb.classList.remove("off");
				bulb.style.opacity = "0.6";
			} else if (diff === 2) {
				bulb.classList.remove("off");
				bulb.style.opacity = "0.3";
			} else {
				bulb.classList.add("off");
				bulb.style.opacity = "0.1";
			}
		});

		currentBulb = (currentBulb + 1) % bulbs.length;
	}

	createBulbs();
	setInterval(animateBulbs, 70);

        const numSectors = sectors.length;
        const arc = (2 * Math.PI) / numSectors;
        
        let currentRotation = 0;
        let idleInterval;
        let isSpinning = false;

        function drawWheel() {
            sectors.forEach((sector, i) => {
                const angle = i * arc;
                ctx.beginPath();
                ctx.fillStyle = sector.color;
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, angle, angle + arc);
                ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.save();
                ctx.translate(200, 200);
                ctx.rotate(angle + arc / 2);
                ctx.textAlign = "right";
                ctx.fillStyle = (sector.color === "#ffcc00" || sector.color === "#d4af37") ? "black" : "white";
                ctx.font = "bold 14px Arial";
                ctx.fillText(sector.label, 190, 8);
                ctx.restore();
            });
        }

        // --- Idle Animation Logic ---
        function startIdleAnimation() {
            if (isSpinning) return;
            canvas.style.transition = "none"; // Animation မရှိဘဲ ဖြည်းဖြည်းချင်း လည်စေရန်
            idleInterval = setInterval(() => {
                currentRotation += 0.5; // အမြန်နှုန်း
                canvas.style.transform = \`rotate(\${currentRotation % 360}deg)\`;
            }, 20);
        }

        function stopIdleAnimation() {
            clearInterval(idleInterval);
        }

        drawWheel();
        startIdleAnimation(); // စဖွင့်ချင်း လည်နေစေရန်

        function shootConfetti() {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1100 };
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } }));
            }, 250);
        }

        function spin() {
            if(isSpinning) return;
            enterFullscreen();
            isSpinning = true;
            spinBtn.disabled = true;
            clearInterval(idleInterval); 

            // 1. Winner Logic
            let rand = Math.random() * 100;
            let cumulativeChance = 0;
            let winnerIndex = 0;
            for (let i = 0; i < sectors.length; i++) {
                cumulativeChance += sectors[i].chance;
                if (rand < cumulativeChance) { winnerIndex = i; break; }
            }

            const win = sectors[winnerIndex];

            // 2. Rotation Animation
            const sectorDeg = 360 / numSectors;
            const targetDeg = (270 - (winnerIndex * sectorDeg) - (sectorDeg / 2));
            const extraSpins = 2160; 
            const finalRotation = (currentRotation - (currentRotation % 360)) + extraSpins + (targetDeg < 0 ? targetDeg + 360 : targetDeg);
            currentRotation = finalRotation;

            canvas.style.transition = "transform 5s cubic-bezier(0.15, 0, 0.15, 1)";
            canvas.style.transform = "rotate(" + currentRotation + "deg)";

            setTimeout(() => {
                // UPDATE STATS DATA HERE
                spinStats.total++;
                spinStats.counts[win.label]++;
                
                // REFRESH UI
                updateStatsUI();
                
                showModal(win.label);
                shootConfetti();
            }, 5000);
        }

        function showModal(prize) {
            prizeDisplay.innerText = prize;
            modalOverlay.style.display = 'flex';
            setTimeout(() => { modalBox.classList.add('active'); }, 10);
        }

        function closeModal() {
            modalBox.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
                isSpinning = false;
                spinBtn.disabled = false;
                startIdleAnimation(); // Modal ပိတ်ရင် Idle ပြန်စမယ်
            }, 300);
        }

		function pickWinnerIndex() {
			const total = sectors.reduce((sum, s) => sum + s.chance, 0);
			const rand = Math.random() * total;

			let cumulative = 0;

			for (let i = 0; i < sectors.length; i++) {
				cumulative += sectors[i].chance;
				if (rand < cumulative) return i;
			}

			return sectors.length - 1;
		}

    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};