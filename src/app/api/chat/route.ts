import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ─── Data helpers ──────────────────────────────────────────────────────────────

async function getDepartments() {
  try {
    const file = path.join(process.cwd(), "data", "departments.json");
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch { return []; }
}

async function getProfessors() {
  try {
    const file = path.join(process.cwd(), "data", "professors.json");
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch { return []; }
}

// ─── Tools definition ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_all_departments",
      description: "استرجاع قائمة جميع الأقسام الدراسية النشطة مع رسومها ونسب قبولها. استخدم هذه الأداة عندما يسأل المستخدم عن الأقسام أو الرسوم أو التخصصات المتاحة.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_department_details",
      description: "استرجاع تفاصيل قسم دراسي محدد بالاسم أو الكود أو المعرف. استخدم هذه الأداة عندما يسأل عن قسم معين.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "اسم القسم بالعربي أو الإنجليزي أو الكود (مثل: CYB, OPT) أو المعرف (مثل: cybersecurity)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_college_info",
      description: "استرجاع المعلومات العامة للكلية كالعنوان وأرقام الهاتف وساعات العمل وروابط السوشيال ميديا.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_departments",
      description: "مقارنة رسوم ونسب القبول بين قسمين أو أكثر.",
      parameters: {
        type: "object",
        properties: {
          queries: {
            type: "array",
            items: { type: "string" },
            description: "قائمة أسماء الأقسام المراد مقارنتها",
          },
        },
        required: ["queries"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_professors",
      description: "استرجاع معلومات الكادر التدريسي والأساتذة في الكلية. استخدم هذه الأداة عندما يسأل عن الأساتذة أو الكادر الجامعي أو رئيس قسم معين.",
      parameters: {
        type: "object",
        properties: {
          department: {
            type: "string",
            description: "اسم القسم لتصفية الأساتذة (اختياري — إذا فارغ يُرجع الكل)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_admission_info",
      description: "استرجاع معلومات القبول والتسجيل والشروط والمواعيد والمنح الدراسية. استخدم هذه الأداة عندما يسأل عن القبول أو التسجيل أو شروط الالتحاق.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

// ─── Tool execution ─────────────────────────────────────────────────────────────

async function executeTool(name: string, args: any): Promise<string> {
  const depts: any[] = await getDepartments();
  const active = depts.filter((d) => d.status !== "inactive");

  switch (name) {
    case "get_all_departments": {
      const list = active.map((d) => ({
        code: d.code,
        nameAr: d.nameAr,
        nameEn: d.nameEn,
        branchAr: d.branchAr,
        morningFees: d.morning,
        eveningFees: d.evening !== "0" ? d.evening : "لا يوجد",
        morningRate: d.morningRate,
        eveningRate: d.eveningRate !== "0.00%" ? d.eveningRate : "لا يوجد",
      }));
      return JSON.stringify({ total: list.length, departments: list });
    }

    case "get_department_details": {
      const q = (args.query || "").toLowerCase().trim();
      const dept = active.find(
        (d) =>
          d.nameAr?.includes(args.query) ||
          d.nameEn?.toLowerCase().includes(q) ||
          d.slug?.toLowerCase() === q ||
          d.code?.toLowerCase() === q ||
          d.nameAr?.toLowerCase().includes(q)
      );
      if (!dept) return JSON.stringify({ found: false, message: "لم يتم العثور على القسم" });
      return JSON.stringify({
        found: true,
        code: dept.code,
        nameAr: dept.nameAr,
        nameEn: dept.nameEn,
        descAr: dept.descAr,
        branchAr: dept.branchAr,
        morningFees: dept.morning + " دينار عراقي",
        eveningFees: dept.evening !== "0" ? dept.evening + " دينار عراقي" : "لا يوجد دوام مسائي",
        morningRate: dept.morningRate,
        eveningRate: dept.eveningRate !== "0.00%" ? dept.eveningRate : "لا يوجد",
        head: dept.head || "غير محدد",
        phone: dept.phone || "غير محدد",
        email: dept.email || "غير محدد",
        location: dept.location || "غير محدد",
      });
    }

    case "get_college_info": {
      return JSON.stringify({
        name: "كلية الشرق",
        nameEn: "Al-Sharq College",
        type: "كلية أهلية للتعليم العالي",
        address: "البصرة - حي الزيتون - طريق حمدان الجديد",
        phone: "07744445669 / 07870703000",
        workingHours: "الأحد – الخميس: 8:00 ص - 3:00 م",
        socialMedia: {
          facebook: "https://www.facebook.com/p/كلية-الشرق-الجامعة-الأهلية-61581110071297/",
          instagram: "https://www.instagram.com/alsharq.uni/",
          youtube: "https://www.youtube.com/@AlsharqUni",
          tiktok: "https://www.tiktok.com/@sharquni",
          telegram: "https://t.me/alsharquni2024",
        },
        totalDepartments: active.length,
      });
    }

    case "compare_departments": {
      const queries: string[] = args.queries || [];
      const results = queries.map((q) => {
        const ql = q.toLowerCase();
        const dept = active.find(
          (d) =>
            d.nameAr?.includes(q) ||
            d.nameEn?.toLowerCase().includes(ql) ||
            d.slug?.toLowerCase() === ql ||
            d.code?.toLowerCase() === ql
        );
        if (!dept) return { query: q, found: false };
        return {
          found: true,
          nameAr: dept.nameAr,
          code: dept.code,
          morningFees: dept.morning,
          eveningFees: dept.evening !== "0" ? dept.evening : "لا يوجد",
          morningRate: dept.morningRate,
          eveningRate: dept.eveningRate !== "0.00%" ? dept.eveningRate : "لا يوجد",
        };
      });
      return JSON.stringify(results);
    }

    case "get_professors": {
      const allProfs: any[] = await getProfessors();
      const activeProfs = allProfs.filter((p) => p.status !== "inactive");

      const positionLabel: Record<string, string> = {
        dean: "عميد الكلية",
        vice_dean: "معاون العميد",
        head: "رئيس قسم",
        professor: "أستاذ",
        assistant_professor: "أستاذ مساعد",
        lecturer: "مدرس",
        instructor: "مدرس مساعد",
        full: "وقت كامل",
        part: "وقت جزئي",
      };

      const deptFilter = (args.department || "").toLowerCase().trim();
      const filtered = deptFilter
        ? activeProfs.filter(
            (p) =>
              p.department?.toLowerCase().includes(deptFilter) ||
              p.department?.includes(args.department)
          )
        : activeProfs;

      if (filtered.length === 0) {
        return JSON.stringify({ found: false, message: "لا يوجد كادر تدريسي مسجّل حالياً" });
      }

      const list = filtered.map((p) => ({
        name: p.name,
        position: positionLabel[p.position] || p.position || "أستاذ",
        department: p.department || "غير محدد",
        type: p.type === "full" ? "دوام كامل" : p.type === "part" ? "دوام جزئي" : p.type,
        email: p.email || "غير متاح",
        phone: p.phone || "غير متاح",
      }));

      return JSON.stringify({ total: list.length, staff: list });
    }

    case "get_admission_info": {
      return JSON.stringify({
        general: "كلية الشرق تقبل الطلاب عبر نظام القبول المركزي في العراق ونظام القبول الخاص",
        morningAdmission: {
          description: "القبول الصباحي عبر التنسيق المركزي للقبول",
          requirement: "شهادة البكالوريا (السادس الإعدادي)",
          minimumRate: "يختلف حسب كل قسم — راجع تفاصيل الأقسام",
          branch: "الفرع العلمي أو الاحيائي حسب القسم",
        },
        eveningAdmission: {
          description: "القبول المسائي متاح لبعض الأقسام",
          note: "يمكن التقديم مباشرة للكلية",
        },
        registration: {
          period: "التسجيل يبدأ في أغسطس من كل عام",
          howToApply: "التقديم إلكترونياً عبر بوابة القبول الإلكتروني في الموقع أو مراجعة الكلية مباشرة",
          documents: [
            "شهادة السادس الإعدادي",
            "صورة الهوية الوطنية",
            "صورة شخصية",
            "شهادة الجنسية",
            "بطاقة السكن",
          ],
        },
        scholarships: {
          available: true,
          types: [
            "منح للطلاب المتفوقين (معدل عالٍ)",
            "منح لذوي الدخل المحدود",
            "تخفيضات للأشقاء المنتسبين للكلية",
          ],
        },
        contact: {
          phone: "07744445669 / 07870703000",
          workingHours: "الأحد – الخميس: 8:00 ص - 3:00 م",
          address: "البصرة - حي الزيتون - طريق حمدان الجديد",
        },
      });
    }

    default:
      return JSON.stringify({ error: "أداة غير معروفة" });
  }
}

// ─── System prompt ──────────────────────────────────────────────────────────────

function buildSystemPrompt(locale: string) {
  const isAr = locale === "ar";
  if (isAr) {
    return `أنت مساعد ذكي متخصص لكلية الشرق الجامعية الأهلية في البصرة، العراق.

مهمتك: مساعدة الطلاب وأولياء الأمور والمهتمين للإجابة عن أسئلتهم بدقة وبأسلوب ودود.

لديك أدوات يمكنك استخدامها للحصول على معلومات حديثة من قاعدة البيانات:
- get_all_departments: قائمة الأقسام والرسوم
- get_department_details: تفاصيل قسم معين
- get_college_info: المعلومات الاتصالية للكلية
- compare_departments: مقارنة أقسام متعددة
- get_professors: الكادر التدريسي والأساتذة
- get_admission_info: شروط القبول والتسجيل والمنح الدراسية

تعليمات:
- استخدم الأدوات دائماً عند الحاجة لمعلومات دقيقة
- أجب بالعربية دائماً ما لم يسألك المستخدم بلغة أخرى
- كن مختصراً وواضحاً — لا تطوّل الإجابة بدون فائدة
- إذا لم تجد المعلومة قل: "يُرجى التواصل مع إدارة الكلية على 07744445669"
- لا تخترع أرقاماً أو معلومات غير موجودة في الأدوات`;
  }
  return `You are a smart assistant for Al-Sharq College in Basra, Iraq.

Your job: help students, parents, and interested parties get accurate and friendly answers.

You have tools to get live data:
- get_all_departments: list of departments and fees
- get_department_details: specific department details
- get_college_info: contact and location info
- compare_departments: compare multiple departments
- get_professors: teaching staff and faculty members
- get_admission_info: admission requirements, registration, and scholarships

Instructions:
- Always use tools when precise information is needed
- Reply in English unless the user writes in another language
- Be concise and clear
- If info is unavailable say: "Please contact the college at 07744445669"
- Never fabricate numbers or information`;
}

// ─── Main handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, locale } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const systemPrompt = buildSystemPrompt(locale || "ar");
    const callMessages: any[] = messages.slice(-12);

    // Tool calling loop — max 4 iterations
    for (let round = 0; round < 4; round++) {
      const response = await fetch(GROQ_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "system", content: systemPrompt }, ...callMessages],
          tools: TOOLS,
          tool_choice: "auto",
          max_tokens: 1024,
          temperature: 0.6,
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        console.error("Groq error:", response.status, rawText);
        return NextResponse.json({ error: "AI service error", detail: rawText.slice(0, 200) }, { status: 502 });
      }

      let data: any;
      try { data = JSON.parse(rawText); } catch {
        console.error("Groq non-JSON response:", rawText.slice(0, 300));
        return NextResponse.json({ error: "AI service error", detail: "Invalid response from AI" }, { status: 502 });
      }
      const choice = data.choices?.[0];
      if (!choice) return NextResponse.json({ error: "No response" }, { status: 502 });

      // ── Final text answer ──
      if (choice.finish_reason !== "tool_calls") {
        return NextResponse.json({ reply: choice.message?.content || "" });
      }

      // ── Execute tool calls ──
      const assistantMsg = choice.message;
      callMessages.push(assistantMsg);

      for (const toolCall of assistantMsg.tool_calls || []) {
        let args: any = {};
        try { args = JSON.parse(toolCall.function.arguments || "{}"); } catch { /* */ }

        const result = await executeTool(toolCall.function.name, args);
        callMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }

    // Fallback — ask for final answer without tools
    const fallbackRes = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...callMessages],
        max_tokens: 512,
        temperature: 0.6,
      }),
    });
    const fallbackData = await fallbackRes.json();
    return NextResponse.json({ reply: fallbackData.choices?.[0]?.message?.content || "" });

  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Server error", detail: err?.message || String(err) }, { status: 500 });
  }
}
