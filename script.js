// ลงทะเบียน Service Worker เพื่อให้แจ้งเตือนนอกแอปได้
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('ระบบพร้อมใช้งาน'))
        .catch(err => console.log('เกิดข้อผิดพลาด:', err));
}

// ขอสิทธิ์แจ้งเตือนจากผู้ใช้
function requestPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}
requestPermission();

// ฟังก์ชันบันทึกข้อมูลลงเครื่อง
function saveTasks(tasks) {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// ฟังก์ชันดึงข้อมูลที่บันทึกไว้มาแสดง
function getTasks() {
    const tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    renderTasks(tasks);
}

function addTask() {
    const taskInput = document.getElementById('todoInput');
    const timeInput = document.getElementById('reminderTime');

    if (taskInput.value.trim() === "") return alert("กรุณากรอกรายการ");

    const newTask = {
        id: Date.now(),
        text: taskInput.value,
        time: timeInput.value,
        completed: false
    };

    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks(tasks);
    
    // สั่งให้ระบบเตรียมแจ้งเตือน
    if (newTask.time) {
        setAlarm(newTask);
    }

    taskInput.value = "";
}

function setAlarm(task) {
    const alertTime = new Date(task.time).getTime();
    const now = new Date().getTime();
    const delay = alertTime - now;

    if (delay > 0) {
        setTimeout(() => {
            // ตรวจสอบอีกครั้งว่ารายการนี้ถูกลบหรือทำเสร็จไปหรือยัง
            let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
            const currentTask = tasks.find(t => t.id === task.id);

            if (currentTask && !currentTask.completed) {
                // 1. เล่นเสียง
                const sound = document.getElementById('notificationSound');
                if (sound) sound.play().catch(() => {});

                // 2. แสดงข้อความแจ้งเตือนแบบ Android (เด้งจากด้านบน)
                if ('serviceWorker' in navigator && Notification.permission === "granted") {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("Checklist", {
                            body: `⏰ ถึงเวลาแล้ว: ${task.text}`,
                            icon: 'https://cdn-icons-png.flaticon.com/512/179/179386.png',
                            vibrate: [200, 100, 200],
                            requireInteraction: true // ค้างไว้จนกว่าจะกดปิด
                        });
                    });
                }
            }
        }, delay);
    }
}