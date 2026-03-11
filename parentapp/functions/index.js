const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

if (!admin.apps.length) { admin.initializeApp(); }

/**
 * Common Function: Har device par notification bhejta hai
 */
async function sendNotification(parentId, title, body, screenData = {}) {
    console.log(`Notification request for Parent: ${parentId}`);
    if (!parentId) return;

    try {
        const parentDoc = await admin.firestore().collection("parents").doc(parentId).get();
        if (!parentDoc.exists) return;

        const tokens = parentDoc.data().fcmTokens || [];
        if (tokens.length === 0) return;

        const message = {
            notification: { title, body },
            data: { 
                ...screenData,
                url: `/${screenData.screen?.toLowerCase() || 'dashboard'}`
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent to ${response.successCount} devices`);
    } catch (e) {
        console.error("FCM Error:", e);
    }
}

// 1. 📚 HOMEWORK (Har bachhe ke liye alag notification)
exports.onHomeworkCreated = onDocumentCreated("homework/{id}", async (event) => {
    const hw = event.data.data();
    if (!hw.className) return;

    const studentsSnap = await admin.firestore().collection("students")
        .where("className", "==", hw.className).get();
    
    // Har student ke liye alag job taaki parent ko pata chale kis bachhe ka HW hai
    const jobs = studentsSnap.docs.map(d => {
        const student = d.data();
        return sendNotification(
            student.parentId, 
            `📚 Naya Homework: ${student.name}`, // Title mein bachhe ka naam
            `${hw.subject}: ${hw.title}`, 
            { screen: "Homework" }
        );
    });
    await Promise.all(jobs);
});

// 2. 📢 NOTICE (Ye school level hai, toh common rahega)
exports.onNoticeCreated = onDocumentCreated("notices/{id}", async (event) => {
    const notice = event.data.data();
    const parentsSnap = await admin.firestore().collection("parents").get();
    
    const jobs = parentsSnap.docs.map(pDoc => 
        sendNotification(pDoc.id, "📢 School Notice", notice.title, { screen: "Dashboard" })
    );
    await Promise.all(jobs);
});

// 3. 📝 RESULT (Individual by studentId)
exports.onResultCreated = onDocumentCreated("examResult/{id}", async (event) => {
    const res = event.data.data();
    if (!res.studentId) return;

    const studentDoc = await admin.firestore().collection("students").doc(res.studentId).get();
    if (studentDoc.exists) {
        const student = studentDoc.data();
        await sendNotification(
            student.parentId, 
            `📝 Result Out: ${student.name}`, 
            `${student.exam || 'Exam'} ka result aa gaya hai.`, 
            { screen: "Marks" }
        );
    }
});

// 4. 📅 ATTENDANCE (Individual)
exports.onAttendanceUpdate = onDocumentUpdated("students/{studentId}", async (event) => {
    const after = event.data.after.data();
    const before = event.data.before.data();
    
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const month = now.toLocaleString("en-US", { month: "long" });
    const dayKey = `${month}_day_${now.getDate()}`;

    const status = after.attendance?.[month]?.[dayKey];
    const prevStatus = before.attendance?.[month]?.[dayKey];

    if (status && status !== prevStatus) {
        const msg = status === "P" ? `✅ ${after.name} school mein hai.` : `❌ ${after.name} aaj absent hai.`;
        await sendNotification(after.parentId, "📅 Attendance Update", msg, { screen: "Attendance" });
    }
});

// 5. 💰 FEES PAID (Individual)
exports.onFeesPaid = onDocumentUpdated("feesManage/{studentId}", async (event) => {
    const after = event.data.after.data();
    const before = event.data.before.data();

    const historyAfter = after.history || [];
    const historyBefore = before.history || [];

    if (historyAfter.length > historyBefore.length) {
        const lastPay = historyAfter[historyAfter.length - 1];
        const studentId = event.params.studentId;

        const studentDoc = await admin.firestore().collection("students").doc(studentId).get();
        if (studentDoc.exists) {
            const student = studentDoc.data();
            await sendNotification(
                student.parentId, 
                "💰 Fees Received", 
                `${student.name} ki ₹${lastPay.received} fees jama ho gayi hai.`, 
                { screen: "Fees" }
            );
        }
    }
});

// 6. ⏰ DAILY UNPAID REMINDER (Individual per student)
exports.dailyFeesReminder = onSchedule("0 10 * * *", async (event) => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentMonth = now.toLocaleString("en-US", { month: "long" });

    try {
        const pendingSnap = await admin.firestore().collection("feesManage")
            .where(`months.${currentMonth}.status`, "==", "Unpaid")
            .get();

        const jobs = pendingSnap.docs.map(async (doc) => {
            const studentId = doc.id;
            const studentDoc = await admin.firestore().collection("students").doc(studentId).get();
            
            if (studentDoc.exists) {
                const student = studentDoc.data();
                return sendNotification(
                    student.parentId, 
                    "⚠️ Fees Reminder", 
                    `${student.name} ki ${currentMonth} ki fees pending hai.`, 
                    { screen: "Fees" }
                );
            }
        });
        await Promise.all(jobs);
    } catch (e) {
        console.error("Reminder Error:", e);
    }
});