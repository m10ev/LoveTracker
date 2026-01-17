import './style.scss';

document.addEventListener('DOMContentLoaded', () => {
    const interBubble = document.querySelector<HTMLDivElement>('.interactive')!;
    let curX = 0, curY = 0;
    let tgX = 0, tgY = 0;
    let animationPaused = false;
    let animationId: number;

    function move() {
        if (!animationPaused) {
            curX += (tgX - curX) / 20;
            curY += (tgY - curY) / 20;

            interBubble.style.transform = `translate(${Math.round(curX - interBubble.offsetWidth/2)}px, ${Math.round(curY - interBubble.offsetHeight/2)}px)`;
        }

        animationId = requestAnimationFrame(move);
    }

    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    // Touch support for mobile
    window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            tgX = event.touches[0].clientX;
            tgY = event.touches[0].clientY;
        }
    });

    window.addEventListener('touchstart', (event) => {
        if (event.touches.length > 0) {
            tgX = event.touches[0].clientX;
            tgY = event.touches[0].clientY;
        }
    });

    move();

    const startDate = new Date("2024-06-27T19:03:00+03:00");
    const timerEl = document.getElementById("countup-timer")!;
    const controlsEl = document.getElementById("controls")!;
    const subtitleEl = document.getElementById("subtitle")!;

    let viewMode = 0; // 0: default, 1: months/weeks, 2: total days, 3: simple
    const totalModes = 4;

    // Load saved milestones from localStorage
    let celebratedMilestones: number[] = [];
    try {
        const saved = localStorage.getItem('celebratedMilestones');
        if (saved) {
            celebratedMilestones = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load milestones:', e);
    }

    function saveMilestones() {
        try {
            localStorage.setItem('celebratedMilestones', JSON.stringify(celebratedMilestones));
        } catch (e) {
            console.error('Failed to save milestones:', e);
        }
    }

    function updateCountUp() {
        const now = new Date();
        const diffMs = now.getTime() - startDate.getTime();
        
        const totalSeconds = Math.floor(diffMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        
        const years = Math.floor(totalDays / 365.25);
        const daysAfterYears = totalDays - Math.floor(years * 365.25);
        
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        switch(viewMode) {
            case 0: // Default: years, days, hours, minutes, seconds
                timerEl.textContent = `${years}\u00A0${years === 1 ? 'year' : 'years'} | ${daysAfterYears}\u00A0${daysAfterYears === 1 ? 'day' : 'days'} | ${hours}\u00A0${hours === 1 ? 'hour' : 'hours'} | ${minutes}\u00A0${minutes === 1 ? 'minute' : 'minutes'} | ${seconds}\u00A0${seconds === 1 ? 'second' : 'seconds'}`;
                break;
            
            case 1: // Months and weeks
                let totalMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
                if (now.getDate() < startDate.getDate()) totalMonths--;

                let monthPassedDate = new Date(startDate);
                monthPassedDate.setMonth(startDate.getMonth() + totalMonths);

                let diffDaysFromMonth = Math.floor((now.getTime() - monthPassedDate.getTime()) / (1000 * 60 * 60 * 24));
                let weeks = Math.floor(diffDaysFromMonth / 7);
                let daysLeft = diffDaysFromMonth % 7;

                timerEl.textContent = `${totalMonths}\u00A0${totalMonths === 1 ? 'month' : 'months'} | ${weeks} ${weeks === 1 ? 'week' : 'weeks'} | ${daysLeft}\u00A0${daysLeft === 1 ? 'day' : 'days'}`;
                break;
            
            case 2: // Total time units
                timerEl.textContent = `${totalDays.toLocaleString()}\u00A0${totalDays === 1 ? 'day' : 'days'} | ${totalHours.toLocaleString()}\u00A0${hours === 1 ? 'hour' : 'hours'} | ${totalMinutes.toLocaleString()}\u00A0${minutes === 1 ? 'minute' : 'minutes'}`;
                break;
            
            case 3: // Simple
                timerEl.textContent = `${totalDays.toLocaleString()}\u00A0${totalDays === 1 ? 'day' : 'days'} together`;
                break;
        }

        checkMilestones(now);
    }

    // Milestone tracking
    function checkMilestones(now: Date) {
        let totalMonths =
            (now.getFullYear() - startDate.getFullYear()) * 12 +
            (now.getMonth() - startDate.getMonth());

        if (now.getDate() < startDate.getDate()) {
            totalMonths--;
        }

        if (totalMonths <= 0) return;

        // Find latest uncelebrated milestone
        for (let m = totalMonths; m >= 1; m--) {
            if (!celebratedMilestones.includes(m)) {
                celebratedMilestones.push(m);
                saveMilestones();
                showMilestone(m);
                break;
            }
        }
    }   


    function showMilestone(months: number) {
        if (document.querySelector('.milestone-celebration')) {
            return;
        }

        const celebration = document.createElement('div');
        celebration.className = 'milestone-celebration';

        let displayText = '';
        if (months >= 12) {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;

            displayText = `🎉\u00A0${years}\u00A0${years === 1 ? 'Year' : 'Years'}`;
            if (remainingMonths > 0) {
                displayText += `\u00A0and\u00A0${remainingMonths}\u00A0${remainingMonths === 1 ? 'Month' : 'Months'}`;
            }
            displayText += '\u00A0Together!\u00A0🎉';
        } else {
            displayText = `🎉\u00A0${months}\u00A0${months === 1 ? 'Month' : 'Months'}\u00A0Together!\u00A0🎉`;
        }

        celebration.innerHTML = `
            <div>${displayText}</div>
            <div class="milestone-date">${new Date().toLocaleDateString()}</div>
        `;

        document.body.appendChild(celebration);

        setTimeout(() => celebration.remove(), 4000);
    }


    updateCountUp();
    setInterval(updateCountUp, 1000);

    // Timer click to cycle modes
    timerEl.addEventListener("click", () => {
        timerEl.classList.add('fadeout');
        setTimeout(() => {
            viewMode = (viewMode + 1) % totalModes;
            updateCountUp();
            timerEl.classList.remove('fadeout');
        }, 400);
    });

    // Copy to clipboard
    document.getElementById('copy-btn')?.addEventListener('click', async () => {
        const text = timerEl.textContent || '';
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!');
    });

    // Share button
    document.getElementById('share-btn')?.addEventListener('click', async () => {
        const text = `💕 ${timerEl.textContent} 💕`;
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Our Time Together 💕',
                    text,
                    url
                });
                return;
            } catch (err) {
                // User cancelled → ignore
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Fallback (desktop / unsupported)
        showNotification('Sharing not supported on this device');
    });


        // Pause/Resume animations
        document.getElementById('pause-btn')?.addEventListener('click', () => {
        animationPaused = !animationPaused;
        const btn = document.getElementById('pause-btn')!;
    
        btn.innerHTML = animationPaused
            ? '<i class="fi fi-rr-play"></i> <span class="btn-text">Play</span>'
            : '<i class="fi fi-rr-pause"></i> <span class="btn-text">Pause</span>';
    
        const gradients = document.querySelector('.gradients-container')!;
        if (animationPaused) {
            gradients.classList.add('paused');
        } else {
            gradients.classList.remove('paused');
        }
    });

    // Theme switcher
    let currentTheme = 0;
    const themes = [
        { name: 'default', colors: ['218, 82, 255', '221, 74, 180', '120, 200, 255', '200, 50, 100', '255, 200, 50'] },
        { name: 'romantic', colors: ['255, 105, 180', '255, 20, 147', '255, 182, 193', '219, 112, 147', '255, 105, 180'] },
        { name: 'ocean', colors: ['0, 150, 255', '0, 200, 255', '100, 200, 255', '50, 150, 200', '150, 220, 255'] },
        { name: 'sunset', colors: ['255, 140, 0', '255, 69, 0', '255, 215, 0', '255, 99, 71', '255, 165, 0'] },
        { name: 'forest', colors: ['34, 139, 34', '144, 238, 144', '60, 179, 113', '46, 139, 87', '124, 252, 0'] }
    ];

    document.getElementById('theme-btn')?.addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % themes.length;
        const theme = themes[currentTheme];
        
        const root = document.documentElement;
        root.style.setProperty('--color1', theme.colors[0]);
        root.style.setProperty('--color2', theme.colors[1]);
        root.style.setProperty('--color3', theme.colors[2]);
        root.style.setProperty('--color4', theme.colors[3]);
        root.style.setProperty('--color5', theme.colors[4]);
        
        showNotification(`Theme: ${theme.name}`);
    });

    // Toggle subtitle
    document.getElementById('subtitle-btn')?.addEventListener('click', () => {
        subtitleEl.classList.toggle('hidden');
    });

    // Toggle controls
    document.getElementById('toggle-controls')?.addEventListener('click', () => {
        controlsEl.classList.toggle('hidden');
    });

    // View milestones history
    document.getElementById('history-btn')?.addEventListener('click', () => {
        showMilestoneHistory();
    });

    function showMilestoneHistory() {
        const existing = document.querySelector('.milestone-history');
        if (existing) {
            existing.remove();
            return;
        }
        if (celebratedMilestones.length === 0) {
            showNotification('No milestones yet!');
            return;
        }

        const historyDiv = document.createElement('div');
        historyDiv.className = 'milestone-history';
    
        const title = document.createElement('h2');
        title.textContent = '🎉 Milestone History';
        historyDiv.appendChild(title);

        const list = document.createElement('ul');
        celebratedMilestones.sort((a, b) => b - a).forEach(milestone => {
            const item = document.createElement('li');

            if (milestone >= 12) {
                const years = Math.floor(milestone / 12);
                const months = milestone % 12;
                item.textContent = `${years} ${years === 1 ? 'year' : 'years'}` + 
                    (months > 0 ? ` and ${months} ${months === 1 ? 'month' : 'months'}` : '');
            } else {
                item.textContent = `${milestone} ${milestone === 1 ? 'month' : 'months'}`;
            }

            list.appendChild(item);
        });
        historyDiv.appendChild(list);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close';
        closeBtn.onclick = () => historyDiv.remove();
        historyDiv.appendChild(closeBtn);

        document.body.appendChild(historyDiv);
    }


    function showNotification(message: string) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    const footer = document.querySelector('.glassy-footer') as HTMLElement;
    const gear = document.getElementById('gear-toggle') as HTMLElement;
    let hideTimeout: number | undefined;

    // Function to show the gear
    function showGear() {
      gear.classList.add('show');
      gear.style.pointerEvents = 'auto';

    // Clear previous timeout if user clicks again
    if (hideTimeout) clearTimeout(hideTimeout);

    // Hide after 10 seconds
    hideTimeout = window.setTimeout(() => {
        gear.classList.remove('show');    // fade out

    // Disable pointer events after fade finishes (matching CSS transition 0.5s)
        setTimeout(() => {
        gear.style.pointerEvents = 'none';
        }, 500);
    }, 5000);
}

    
    // Toggle footer when gear is clicked
    gear.addEventListener('click', () => {
        if (footer.style.transform === 'translateY(100%)') {
        footer.style.transform = 'translateY(0)'; // show footer
    } else {
        footer.style.transform = 'translateY(100%)'; // hide footer
    }
    });

    // Show gear when user clicks anywhere
    document.addEventListener('click', () => {
    showGear();
    });

    // Smooth transition for footer
    footer.style.transition = 'transform 0.3s ease';
});