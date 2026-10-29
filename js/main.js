// DỮ LIỆU MẪU BAN ĐẦU (LƯU TRỮ LOCALSTORAGE)
const defaultExercises = [
    {
        id: 101,
        title: "Tính tổng 2 số nguyên a và b",
        level: "Dễ",
        tests: [
            { in: "1 2", out: "3" },
            { in: "5 5", out: "10" },
            { in: "-1 1", out: "0" },
            { in: "10 20", out: "30" },
            { in: "0 0", out: "0" }
        ]
    },
    {
        id: 102,
        title: "Tìm số lớn hơn trong 2 số",
        level: "Trung bình",
        tests: [
            { in: "3 7", out: "7" },
            { in: "10 2", out: "10" },
            { in: "-5 -1", out: "-1" },
            { in: "8 8", out: "8" },
            { in: "0 4", out: "4" }
        ]
    }
];

if (!localStorage.getItem('java_exercises')) {
    localStorage.setItem('java_exercises', JSON.stringify(defaultExercises));
}

// KHỞI TẠO BẢNG 5 TEST CASE CHO GIÁO VIÊN VÀ DANH SÁCH BÀI TẬP CHO SINH VIÊN
document.addEventListener('DOMContentLoaded', () => {
    const testRows = document.getElementById('testcase-rows');
    if (testRows) {
        for (let i = 1; i <= 5; i++) {
            testRows.innerHTML += `
                <tr>
                    <td>Test ${i}</td>
                    <td><input type="text" class="form-control tc-in" placeholder="Input ${i}"></td>
                    <td><input type="text" class="form-control tc-out" placeholder="Output ${i}"></td>
                </tr>
            `;
        }
    }
    loadStudentExercises();
});

// CHUYỂN PHÂN QUYỀN (GIÁO VIÊN / SINH VIÊN)
function switchRole(role) {
    document.getElementById('btn-student').classList.remove('active');
    document.getElementById('btn-teacher').classList.remove('active');

    if (role === 'teacher') {
        document.getElementById('btn-teacher').classList.add('active');
        document.getElementById('teacher-view').style.display = 'block';
        document.getElementById('student-view').style.display = 'none';
    } else {
        document.getElementById('btn-student').classList.add('active');
        document.getElementById('teacher-view').style.display = 'none';
        document.getElementById('student-view').style.display = 'block';
        loadStudentExercises();
    }
}

// GIÁO VIÊN LƯU BÀI TẬP VÀO LOCALSTORAGE
function teacherSaveExercise() {
    const title = document.getElementById('tc-title').value.trim();
    const level = document.getElementById('tc-level').value;
    const inputs = document.querySelectorAll('.tc-in');
    const outputs = document.querySelectorAll('.tc-out');

    if (!title) {
        alert('Vui lòng nhập tên đề bài tập!');
        return;
    }

    let tests = [];
    for (let i = 0; i < 5; i++) {
        tests.push({
            in: inputs[i].value.trim(),
            out: outputs[i].value.trim()
        });
    }

    const exercises = JSON.parse(localStorage.getItem('java_exercises')) || [];
    exercises.push({
        id: Date.now(),
        title: title,
        level: level,
        tests: tests
    });

    localStorage.setItem('java_exercises', JSON.stringify(exercises));
    alert('Đã lưu bài tập và bộ test vào LocalStorage thành công!');

    document.getElementById('tc-title').value = '';
    inputs.forEach(i => i.value = '');
    outputs.forEach(o => o.value = '');
}

// SINH VIÊN CHỌN BÀI TẬP (KIỂM TRA CHỌN 1, THI CHỌN 2 ĐẾN 3)
let selectedExIds = [];

function loadStudentExercises() {
    const container = document.getElementById('exercise-list-container');
    if (!container) return;

    const mode = document.getElementById('sv-mode').value;
    const exercises = JSON.parse(localStorage.getItem('java_exercises')) || [];
    container.innerHTML = '';
    selectedExIds = [];

    exercises.forEach(ex => {
        const type = (mode === 'check') ? 'radio' : 'checkbox';
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <label style="cursor:pointer; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                <input type="${type}" name="ex_select" value="${ex.id}" onchange="selectExercise(this, ${ex.id}, '${ex.title}')">
                <span><strong>[${ex.level}]</strong> ${ex.title}</span>
            </label>
        `;
        container.appendChild(div);
    });
}

function selectExercise(element, id, title) {
    const mode = document.getElementById('sv-mode').value;

    if (mode === 'check') {
        selectedExIds = [id];
        document.getElementById('selected-title').innerText = `Đã chọn 1 bài kiểm tra: ${title}`;
    } else {
        if (element.checked) {
            if (selectedExIds.length >= 3) {
                alert('Phần Thi chỉ cho phép chọn tối đa 3 bài tập!');
                element.checked = false;
                return;
            }
            selectedExIds.push(id);
        } else {
            selectedExIds = selectedExIds.filter(item => item !== id);
        }
        document.getElementById('selected-title').innerText = `Đã chọn ${selectedExIds.length} bài tập cho Phần Thi (yêu cầu chọn 2-3 bài).`;
    }
}

// CHẤM ĐIỂM TRỰC TIẾP (5 TEST, MỖI TEST ĐÚNG 2 ĐIỂM)
function submitAndGrade() {
    const name = document.getElementById('sv-name').value.trim();
    const svId = document.getElementById('sv-id').value.trim();
    const code = document.getElementById('student-code').value.trim();
    const mode = document.getElementById('sv-mode').value;

    if (!name || !svId) {
        alert('Vui lòng nhập đầy đủ Họ tên và Mã số sinh viên!');
        return;
    }

    if (selectedExIds.length === 0) {
        alert('Vui lòng chọn ít nhất 1 bài tập!');
        return;
    }

    if (mode === 'exam' && selectedExIds.length < 2) {
        alert('Phần Thi yêu cầu sinh viên phải chọn từ 2 đến 3 bài tập!');
        return;
    }

    if (!code) {
        alert('Vui lòng nhập lời giải / mã nguồn Java trước khi nộp bài!');
        return;
    }

    const exercises = JSON.parse(localStorage.getItem('java_exercises')) || [];
    let totalScore = 0;
    let maxScore = selectedExIds.length * 10;
    let detailsHTML = '';

    selectedExIds.forEach((exId, idx) => {
        const ex = exercises.find(item => item.id === exId);
        if (ex) {
            let exScore = 0;
            detailsHTML += `<p style="font-weight: 600; margin-top: 8px;">Bài ${idx + 1}: ${ex.title}</p><ul style="margin-left: 20px;">`;

            ex.tests.forEach((t, tIdx) => {
                let passed = code.includes(t.out) && t.out !== '';
                if (passed) {
                    exScore += 2; // Mỗi test đúng 2 điểm
                    detailsHTML += `<li style="color: #10b981;">Test ${tIdx + 1}: ĐÚNG (+2 điểm)</li>`;
                } else {
                    detailsHTML += `<li style="color: #ef4444;">Test ${tIdx + 1}: SAI (Đầu ra kỳ vọng: "${t.out}")</li>`;
                }
            });

            detailsHTML += `</ul><p style="margin-top: 4px;"><em>Điểm bài này: <strong>${exScore}/10 điểm</strong></em></p><hr style="margin: 10px 0; border:0; border-top: 1px solid var(--border);">`;
            totalScore += exScore;
        }
    });

    const resultDiv = document.getElementById('grade-result');
    resultDiv.style.display = 'block';
    document.getElementById('grade-score').innerHTML = `Kết quả của <span style="color: var(--primary); font-weight:700;">${name} (${svId})</span> - Tổng điểm: <span style="color: #10b981; font-weight:700;">${totalScore} / ${maxScore} Điểm</span>`;
    document.getElementById('grade-details').innerHTML = detailsHTML;
}