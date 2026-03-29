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
			max-height: 80vh;
			overflow-y: auto;
			background: rgba(0,0,0,0.75);
			padding: 15px;
			border-radius: 12px;
			font-size: 14px;
			z-index: 2;
		}

		.side-panels { width: 400px; display: flex; flex-direction: column; gap: 20px; }
        .panel { background: rgba(0,0,0,0.85); padding: 15px; border-radius: 12px; border: 1px solid #444; }
        .panel h3 { margin-top: 0; color: #ffcc00; border-bottom: 1px solid #444; padding-bottom: 8px; font-size: 16px; }

        /* Inventory Manager UI */
        .inventory-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
        .inventory-row input { width: 60px; background: #222; border: 1px solid #555; color: #fff; padding: 4px; border-radius: 4px; text-align: center; }
        .stock-status { font-size: 10px; padding: 2px 5px; border-radius: 3px; font-weight: bold; }
        .in-stock { background: #2e7d32; }
        .out-stock { background: #c62828; }

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
	
	 <div class="side-panels" id="statsPanel">
		<div class="panel">
			<div style="margin-bottom:10px;">
				<input id="newLabel" placeholder="Item" style="width:100%; margin-bottom:5px;">
				<input id="newCat" placeholder="Type" style="width:100%; margin-bottom:5px;">
				<input id="newChance" type="number" placeholder="Chance %" style="width:48%;">
				<input id="newStock" type="number" placeholder="Qty" style="width:48%;">
				<button id="addBtn" style="width:100%; margin-top:5px;">➕ Add Item</button>
			</div>
				<h3>📦 Gift Inventory (Set Qty)</h3>
				<div id="inventoryList"></div>
		</div>

		<div class="panel">
			<h3>📊 Live Statistics</h3>
			<div id="totalSpins" style="margin-bottom:10px; font-weight:bold; color: #ffcc00;">Total Spins: 0</div>
			<div id="statsList"></div>
		</div>
	</div>

    <script>
        const canvas = document.getElementById("wheelCanvas");
        const ctx = canvas.getContext("2d");
        const spinBtn = document.getElementById("spinBtn");
        const modalOverlay = document.getElementById("modalOverlay");
        const modalBox = document.getElementById("modalBox");
        const prizeDisplay = document.getElementById("prizeDisplay");

		const sectors = [
            { label: "$50 Cashback", cat: "Grand Prize", color: "#d4af37", chance: 2 , stock: 1},
            { label: "$20 Cashback", cat: "Special Prize", color: "#e61919", chance: 3 , stock: 1 },
            { label: "$10 Cashback", cat: "Daily Wins", color: "#ffcc00", chance:5, stock: 1 },
            { label: "Free Earphones", cat: "Inventory Clear", color: "#e61919",chance:25, stock: 1 },
            { label: "Free Case/Cable", cat: "Consolation", color: "#ffcc00",chance:30, stock: 1 },
            { label: "Powerbank", cat: "Inventory Clear", color: "#ffcc00",chance:35, stock: 1 },
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

		function renderInventory() {
			const container = document.getElementById("inventoryList");
			container.innerHTML = "";

			sectors.forEach((s, i) => {

				if (typeof s.stock === "undefined") s.stock = 0;

				const row = document.createElement("div");
				row.className = "inventory-row";

				const statusClass = s.stock > 0 ? "in-stock" : "out-stock";

				// LEFT: label + type
				const left = document.createElement("div");
				left.style.display = "flex";
				left.style.flexDirection = "column";

				const label = document.createElement("input");
				label.value = s.label;
				label.style.width = "120px";

				label.addEventListener("input", () => {
					const oldLabel = s.label;
					s.label = label.value;

					// update stats key safely
					spinStats.counts[s.label] = spinStats.counts[oldLabel] || 0;
					delete spinStats.counts[oldLabel];

					updateStatsUI();
					drawWheel();
				});

				const cat = document.createElement("input");
				cat.value = s.cat;
				cat.style.width = "120px";

				cat.addEventListener("input", () => {
					s.cat = cat.value;
				});

				left.appendChild(label);
				left.appendChild(cat);

				// RIGHT SIDE
				const right = document.createElement("div");
				right.style.display = "flex";
				right.style.alignItems = "center";
				right.style.gap = "6px";

				// chance
				const chance = document.createElement("input");
				chance.type = "number";
				chance.value = s.chance;

				chance.addEventListener("input", (e) => {
					s.chance = parseFloat(e.target.value) || 0;
					normalizeChances();
					updateStatsUI();
				});

				// stock
				const stock = document.createElement("input");
				stock.type = "number";
				stock.value = s.stock;

				stock.addEventListener("input", (e) => {
					s.stock = Math.max(0, parseInt(e.target.value) || 0);
					renderInventory();
				});

				// status
				const status = document.createElement("span");
				status.className = "stock-status " + statusClass;
				status.textContent = s.stock > 0 ? "IN" : "OUT";

				// delete
				const del = document.createElement("button");
				del.textContent = "❌";

				del.addEventListener("click", () => {
					delete spinStats.counts[s.label];
					sectors.splice(i, 1);

					normalizeChances();
					renderInventory();
					drawWheel();
					updateStatsUI();
				});

				right.appendChild(chance);
				right.appendChild(stock);
				right.appendChild(status);
				right.appendChild(del);

				row.appendChild(left);
				row.appendChild(right);

				container.appendChild(row);
			});
		}

        function updateStock(index, val) {
            sectors[index].stock = Math.max(0, parseInt(val) || 0);
            renderInventory();
        }

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
			const ctx = canvas.getContext("2d");
			const radius = canvas.width / 2;
			const arc = (2 * Math.PI) / sectors.length;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			sectors.forEach((sector, i) => {
				const angle = i * arc;

				// 🎨 Draw slice
				ctx.beginPath();
				ctx.moveTo(radius, radius);
				ctx.arc(radius, radius, radius, angle, angle + arc);
				ctx.fillStyle = sector.color || getRandomColor(i);
				ctx.fill();
				ctx.stroke();

				// 🔤 Draw text
				ctx.save(); // IMPORTANT

				ctx.translate(radius, radius);
				ctx.rotate(angle + arc / 2);

				ctx.textAlign = "right";
				ctx.fillStyle = "#fff";
				ctx.font = "bold 14px Arial";

				// ✂️ Trim long text
				let label = sector.label;
				if (label.length > 10) {
					label = label.substring(0, 10) + "...";
				}

				ctx.fillText(formatLabel(sector.label), radius - 10, 5);
				ctx.restore(); // IMPORTANT
			});
		}

		function formatLabel(text) {
			if (text.length > 20) {
				return text.slice(0, 8) + "...";
			}
			return text;
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

			// ✅ SAFE WINNER SELECTION (STOCK-AWARE)
			let winnerIndex = pickWinnerIndex();

			 if (winnerIndex === -1) {
				alert("No items available to win!");
				isSpinning = false;
				spinBtn.disabled = false;
				return;
			}

			const win = sectors[winnerIndex];

			// ❌ HARD BLOCK (no fake wins)
			if (!win || win.stock <= 0) {
				console.error("Invalid winner selected:", win);
				isSpinning = false;
				spinBtn.disabled = false;
				return;
			}

			// ✅ Deduct stock
			win.stock--;

			// 🎯 Rotation
			const sectorDeg = 360 / sectors.length;
			const targetDeg = (270 - (winnerIndex * sectorDeg) - (sectorDeg / 2));
			const extraSpins = 2160;

			const finalRotation =
				(currentRotation - (currentRotation % 360)) +
				extraSpins +
				(targetDeg < 0 ? targetDeg + 360 : targetDeg);

			currentRotation = finalRotation;

			canvas.style.transition = "transform 5s cubic-bezier(0.15, 0, 0.15, 1)";
			canvas.style.transform = "rotate(" + currentRotation + "deg)";

			setTimeout(() => {

				// ✅ VALID STATS ONLY
				spinStats.total++;
				spinStats.counts[win.label] = (spinStats.counts[win.label] || 0) + 1;

				renderInventory();     // 🔥 sync stock UI
				updateStatsUI();       // 🔥 sync stats UI

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
			const available = sectors.filter(s => s.stock > 0 && s.chance > 0);

			if (available.length === 0) {
				console.error("No available rewards!");
				return -1;
			}

			const total = available.reduce((sum, s) => sum + s.chance, 0);
			const rand = Math.random() * total;

			let cumulative = 0;

			for (let i = 0; i < available.length; i++) {
				cumulative += available[i].chance;
				if (rand < cumulative) {
					return sectors.indexOf(available[i]);
				}
			}

			return sectors.indexOf(available[0]);
		}

		document.getElementById("addBtn").addEventListener("click", addItem);

		function addItem() {
			const label = document.getElementById("newLabel").value.trim();
			const cat = document.getElementById("newCat").value.trim();
			const chance = parseFloat(document.getElementById("newChance").value);
			const stock = parseInt(document.getElementById("newStock").value);

			if (!label || isNaN(chance)) {
				alert("Label and Chance are required");
				return;
			}

			sectors.push({
				label,
				cat,
				chance,
				stock: stock || 0,
				color: Math.random() > 0.5 ? "#ffcc00" : "#e61919"
			});

			// init stats
			spinStats.counts[label] = 0;

			clearInputs();
			normalizeChances();

			renderInventory();
			drawWheel();
			updateStatsUI();
		}

		function clearInputs() {
			document.getElementById("newLabel").value = "";
			document.getElementById("newCat").value = "";
			document.getElementById("newChance").value = "";
			document.getElementById("newStock").value = "";
		}

		function normalizeChances() {
			const total = sectors.reduce((sum, s) => sum + s.chance, 0);

			if (total === 0) return;

			sectors.forEach(s => {
				s.chance = (s.chance / total) * 100;

				if (s.chance < 0.5) s.chance = 0.5;

			});
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