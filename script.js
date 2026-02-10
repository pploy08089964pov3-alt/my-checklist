// ขออนุญาตแจ้งเตือน (ต้องกดตกลงเมื่อเว็บถาม)
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

document.addEventListener('DOMContentLoaded', getTasks);

// ใช้ ID ให้ตรงกับ HTML
document.getElementById('addBtn').addEventListener('click', addTask);

function addTask() {
    const taskInput = document.getElementById('todoInput');
    const timeInput = document.getElementById('reminderTime');

    // แก้ปัญหา: เช็คค่าว่างให้ละเอียดขึ้น
    if (!taskInput.value.trim()) {
        alert("กรุณากรอกรายการที่ต้องทำ");
        return;
    }

    const taskData = {
        id: Date.now(),
        text: taskInput.value,
        time: timeInput.value, 
        completed: false
    };

    renderTask(taskData);
    saveLocalTask(taskData);
    if (taskData.time) setAlarm(taskData);

    // ล้างค่าหลังเพิ่มเสร็จ
    taskInput.value = '';
    timeInput.value = '';
}

function renderTask(task) {
    const list = document.getElementById('todoList');
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id}, this)">
        <div style="flex-grow: 1; margin-left: 10px;">
            <strong class="task-text">${task.text}</strong><br>
            <small>⏰ ${task.time ? new Date(task.time).toLocaleString('th-TH') : 'ไม่ได้ตั้งเวลา'}</small>
        </div>
        <button onclick="removeTask(${task.id}, this)">ลบ</button>
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
                // 1. เล่นเสียง (จะดังต่อเมื่อคุณเคยคลิกหน้าเว็บนั้นอย่างน้อย 1 ครั้ง)
                const sound = document.getElementById('notificationSound');
                if (sound) sound.play().catch(() => console.log("รอการคลิกเพื่อเล่นเสียง"));

                // 2. แจ้งเตือนข้อความบนหน้าจอ (Notification)
                if (Notification.permission === "granted") {
                    new Notification("🔔 ถึงเวลาแล้ว!", { body: task.text });
                }
                
                // 3. แจ้งเตือนแบบ Alert (กันพลาด)
                alert("⏰ แจ้งเตือน: " + task.text);
            }
        }, delay);
    }
}

// ฟังก์ชันอื่นๆ (Toggle/Save/Get/Remove) เหมือนเดิมแต่เช็ค Logic ให้แม่น
function toggleComplete(id, checkbox) {
    const li = checkbox.parentElement;
    li.classList.toggle('completed', checkbox.checked);
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        tasks[idx].completed = checkbox.checked;
        localStorage.setItem('myTasks', JSON.stringify(tasks));
    }
}

function saveLocalTask(task) {
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    tasks.push(task);
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

function getTasks() {
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    tasks.forEach(task => {
        renderTask(task);
        if (!task.completed) setAlarm(task);
    });
}

function removeTask(id, element) {
    element.parentElement.remove();
    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    localStorage.setItem('myTasks', JSON.stringify(tasks.filter(t => t.id !== id)));
}