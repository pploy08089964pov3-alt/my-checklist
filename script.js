console.log("สคริปต์โหลดสำเร็จ!");

// ขออนุญาตแจ้งเตือน
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// รอให้หน้าเว็บโหลดเสร็จก่อนค่อยทำงาน
window.onload = function() {
    const addButton = document.getElementById('addBtn');
    
    if (addButton) {
        console.log("เจอตัวปุ่มแล้ว!");
        addButton.onclick = addTask;
    } else {
        console.error("หาปุ่ม 'addBtn' ไม่เจอในหน้า HTML!");
    }
    
    getTasks();
};

function addTask() {
    console.log("กำลังพยายามเพิ่มรายการ...");
    
    const taskInput = document.getElementById('todoInput');
    const timeInput = document.getElementById('reminderTime');

    // 1. เช็คว่าเจอช่องกรอกไหม
    if (!taskInput || !timeInput) {
        console.error("หาช่องกรอกข้อมูลไม่เจอ!");
        return;
    }

    // 2. เช็คว่ากรอกข้อความหรือยัง
    if (taskInput.value.trim() === "") {
        alert("กรุณากรอกรายการที่ต้องทำ");
        return;
    }

    const taskData = {
        id: Date.now(),
        text: taskInput.value,
        time: timeInput.value,
        completed: false
    };

    console.log("ข้อมูลที่กำลังจะเพิ่ม:", taskData);

    renderTask(taskData);
    saveLocalTask(taskData);
    if (taskData.time) setAlarm(taskData);

    // ล้างค่า
    taskInput.value = '';
    timeInput.value = '';
}

function renderTask(task) {
    const list = document.getElementById('todoList');
    if (!list) return;

    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id}, this)">
        <div style="flex-grow: 1; margin-left: 10px;">
            <strong class="task-text">${task.text}</strong><br>
            <small>⏰ ${task.time ? new Date(task.time).toLocaleString('th-TH') : 'ไม่ได้ตั้งเวลา'}</small>
        </div>
        <button onclick="removeTask(${task.id}, this)" style="background:red; color:white;">ลบ</button>
    `;
    list.appendChild(li);
}

function setAlarm(task) {
    const alertTime = new Date(task.time).getTime();
    const now = new Date().getTime();
    const delay = alertTime - now;

    if (delay > 0) {
        setTimeout(() => {
            let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
            const currentTask = tasks.find(t => t.id === task.id);
            
            if (currentTask && !currentTask.completed) {
                const sound = document.getElementById('notificationSound');
                if (sound) sound.play().catch(() => {});
                
                if (Notification.permission === "granted") {
                    new Notification("🔔 แจ้งเตือน: " + task.text);
                }
                alert("⏰ ถึงเวลา: " + task.text);
            }
        }, delay);
    }
}

// --- ฟังก์ชันเสริม (Save/Load/Remove) ---
function saveLocalTask(task) {
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    tasks.push(task);
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

function getTasks() {
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    tasks.forEach(task => renderTask(task));
}

function toggleComplete(id, checkbox) {
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        tasks[idx].completed = checkbox.checked;
        localStorage.setItem('myTasks', JSON.stringify(tasks));
        location.reload(); // รีโหลดเพื่อให้ขีดฆ่าแสดงผล
    }
}

function removeTask(id, element) {
    element.parentElement.remove();
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    localStorage.setItem('myTasks', JSON.stringify(tasks.filter(t => t.id !== id)));
}