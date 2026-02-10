// 1. ขออนุญาตแจ้งเตือนจาก Browser
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// 2. โหลดข้อมูลที่บันทึกไว้ขึ้นมาแสดงเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', getTasks);

// 3. เชื่อมโยงปุ่มเพิ่มรายการ
const btn = document.getElementById('addBtn') || document.querySelector('button');
btn.addEventListener('click', addTask);

function addTask() {
    const taskInput = document.getElementById('todoInput');
    const timeInput = document.getElementById('reminderTime');

    if (!taskInput.value) return alert("กรุณากรอกข้อมูล");

    // สร้าง Object ข้อมูลงาน (เพิ่มสถานะ completed: false)
    const taskData = {
        id: Date.now(),
        text: taskInput.value,
        time: timeInput.value,
        completed: false
    };

    renderTask(taskData);    // แสดงผลบนหน้าจอ
    saveLocalTask(taskData); // บันทึกลงเครื่อง
    setAlarm(taskData);      // ตั้งเวลาเตือน

    // เคลียร์ช่องกรอกข้อมูล
    taskInput.value = '';
    timeInput.value = '';
}

// ฟังก์ชันสร้าง UI รายการงานบนหน้าจอ
function renderTask(task) {
    const list = document.getElementById('todoList');
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    
    // ถ้างานไหนทำเสร็จแล้ว ให้ใส่คลาส "completed" เพื่อขีดฆ่า
    if (task.completed) {
        li.classList.add('completed');
    }

    li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="toggleComplete(${task.id}, this)">
        <div style="flex-grow: 1; margin-left: 10px;">
            <strong class="task-text">${task.text}</strong><br>
            <small>⏰ ${task.time ? new Date(task.time).toLocaleString() : 'ไม่ระบุเวลา'}</small>
        </div>
        <button onclick="removeTask(${task.id}, this)" style="background:#ff4757; color:white; border:none; border-radius:5px; padding:8px 12px; cursor:pointer;">ลบ</button>
    `;
    list.appendChild(li);
}

// ฟังก์ชันตั้งเวลาเตือนและเล่นเสียง
function setAlarm(task) {
    if (!task.time || task.completed) return; // ไม่เตือนถ้าไม่มีเวลา หรือทำเสร็จแล้ว
    
    const alertTime = new Date(task.time).getTime();
    const now = new Date().getTime();
    const delay = alertTime - now;

    if (delay > 0) {
        setTimeout(() => {
            // เล่นเสียงแจ้งเตือน
            const sound = document.getElementById('notificationSound');
            if (sound) {
                sound.play().catch(() => console.log("รอการคลิกหน้าเว็บก่อนเพื่อเล่นเสียง"));
            }

            // แสดงข้อความแจ้งเตือน
            if (Notification.permission === "granted") {
                new Notification("🔔 แจ้งเตือนรายการ!", { body: task.text });
            }
            alert("⏰ ถึงเวลาแล้ว: " + task.text);
        }, delay);
    }
}

// ฟังก์ชันสลับสถานะ ติ๊กถูก / เอาออก (อัปเดต LocalStorage)
function toggleComplete(id, checkbox) {
    const li = checkbox.parentElement;
    
    if (checkbox.checked) {
        li.classList.add('completed');
    } else {
        li.classList.remove('completed');
    }

    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].completed = checkbox.checked;
        localStorage.setItem('myTasks', JSON.stringify(tasks));
    }
}

// --- ระบบจัดการข้อมูล LocalStorage ---

function saveLocalTask(task) {
    let tasks = localStorage.getItem('myTasks') ? JSON.parse(localStorage.getItem('myTasks')) : [];
    tasks.push(task);
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

function getTasks() {
    let tasks = localStorage.getItem('myTasks') ? JSON.parse(localStorage.getItem('myTasks')) : [];
    tasks.forEach(task => {
        renderTask(task);
        if (!task.completed) setAlarm(task); // ตั้งเตือนเฉพาะงานที่ยังไม่เสร็จ
    });
}

function removeTask(id, element) {
    element.parentElement.remove();
    let tasks = JSON.parse(localStorage.getItem('myTasks'));
    const filteredTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('myTasks', JSON.stringify(filteredTasks));
}