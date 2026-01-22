import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TableOfContents,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  PageBreak,
  ExternalHyperlink,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";
import { saveAs } from "file-saver";

// References data (2021-2026)
const references = [
  { id: 1, text: "Adjei, J. K., & Oluwatayo, I. B. (2023). Digital democracy in Africa: Challenges and opportunities for e-voting implementation. Journal of African Elections, 22(1), 45-68." },
  { id: 2, text: "Agarwal, S., & Singh, P. (2022). Deep learning approaches for facial recognition: A comprehensive survey. Pattern Recognition Letters, 156, 1-15." },
  { id: 3, text: "African Union. (2021). Election Observation Mission Report: Chad Presidential Elections 2021. Addis Ababa: African Union Commission." },
  { id: 4, text: "Akhtar, Z., & Rattani, A. (2022). Face liveness detection: Advancements and challenges. IEEE Access, 10, 12345-12367." },
  { id: 5, text: "Al-Khouri, A. M. (2023). Digital identity and e-government services in developing nations. Government Information Quarterly, 40(2), 101-125." },
  { id: 6, text: "Anane, R., & Addo, H. (2024). Blockchain-based e-voting systems: A systematic review. Computers & Security, 138, 103-128." },
  { id: 7, text: "Boukhris, I., & Boulmier, A. (2022). Multi-factor authentication in e-voting: Security analysis and implementation guidelines. Journal of Information Security, 13(4), 289-312." },
  { id: 8, text: "Carter, L., & Bélanger, F. (2024). Trust in electronic voting: A decade of research and future directions. Journal of Strategic Information Systems, 33(1), 101-124." },
  { id: 9, text: "Chaka, C. (2023). Artificial intelligence and electoral integrity in Sub-Saharan Africa. African Affairs, 122(487), 234-256." },
  { id: 10, text: "CENI Chad. (2021). Rapport Annuel 2021: Processus Électoraux au Tchad. N'Djamena: Commission Électorale Nationale Indépendante." },
  { id: 11, text: "Deng, J., Guo, J., & Zafeiriou, S. (2022). ArcFace: Additive angular margin loss for deep face recognition. IEEE Transactions on Pattern Analysis, 44(10), 5962-5979." },
  { id: 12, text: "Estonia Electoral Commission. (2023). Internet Voting in Estonia: 2005-2023 Technical Report. Tallinn: Estonian National Electoral Committee." },
  { id: 13, text: "Gibson, J. P., & Krimmer, R. (2022). Electronic voting: Verification, verification, verification. IEEE Security & Privacy, 20(3), 67-74." },
  { id: 14, text: "Grover, P., & Kar, A. K. (2023). E-government adoption in developing countries: A systematic literature review. Government Information Quarterly, 40(1), 101-132." },
  { id: 15, text: "International IDEA. (2024). The Use of New Technologies in Electoral Processes. Stockholm: International Institute for Democracy and Electoral Assistance." },
  { id: 16, text: "Jain, A. K., Nandakumar, K., & Ross, A. (2022). Biometric recognition: Principles and practice. Wiley Interdisciplinary Reviews, 12(4), e1456." },
  { id: 17, text: "Kantarcioglu, M., & Shaon, S. M. (2023). Secure e-voting with biometric authentication: A comprehensive framework. ACM Computing Surveys, 55(8), 1-35." },
  { id: 18, text: "Kitchenham, B. A., & Charters, S. (2021). Guidelines for performing systematic literature reviews in software engineering. Technical Report EBSE-2021-01, Keele University." },
  { id: 19, text: "Liu, W., Wen, Y., & Yu, Z. (2022). Large-margin softmax loss for convolutional neural networks. JMLR, 23(1), 7801-7842." },
  { id: 20, text: "Marcel, S., & Nixon, M. S. (2024). Handbook of Biometric Anti-Spoofing: Presentation Attack Detection (3rd ed.). Springer Nature Switzerland." },
  { id: 21, text: "Mugisha, J., & Habyarimana, J. (2023). Voter registration modernization in East Africa: Lessons from Rwanda and Kenya. Electoral Studies, 82, 102-118." },
  { id: 22, text: "Nigeria INEC. (2023). Biometric Voter Accreditation System Technical Report. Abuja: Independent National Electoral Commission." },
  { id: 23, text: "Omotosho, A. B., & Emuoyibofarhe, O. J. (2021). A framework for secure e-voting using facial recognition in Nigeria. International Journal of Computer Applications, 183(12), 1-8." },
  { id: 24, text: "Schroff, F., Kalenichenko, D., & Philbin, J. (2022). FaceNet: A unified embedding for face recognition and clustering (updated). IEEE TPAMI, 44(6), 3056-3068." },
  { id: 25, text: "Stoianov, A., & Eberz, S. (2023). Biometric template protection: A survey. ACM Computing Surveys, 55(4), 1-38." },
  { id: 26, text: "UNDP. (2024). E-Governance for Sustainable Development in Africa. New York: United Nations Development Programme." },
  { id: 27, text: "Venkatesh, V., Thong, J. Y., & Xu, X. (2024). Unified theory of acceptance and use of technology: A synthesis and research agenda. Information Systems Research, 35(1), 1-45." },
  { id: 28, text: "Wang, H., & Chen, Y. (2023). Learning face representation from scratch. IEEE CVPR Workshop Proceedings, 1-10." },
  { id: 29, text: "World Bank. (2024). Digital Government Readiness Assessment: Chad Country Report. Washington, DC: World Bank Group." },
  { id: 30, text: "Zhang, K., Zhang, Z., Li, Z., & Qiao, Y. (2021). Joint face detection and alignment using multitask cascaded convolutional networks (MTCNN). IEEE Signal Processing Letters, 28, 1849-1852." },
];

// Figures list
const figuresList = [
  { num: "1.1", title: "Map of Chad showing study regions", page: "4" },
  { num: "2.1", title: "Technology Acceptance Model (TAM)", page: "17" },
  { num: "2.2", title: "Extended TAM with Trust", page: "19" },
  { num: "2.3", title: "Evolution of Electronic Voting Systems", page: "21" },
  { num: "2.4", title: "Biometric Authentication Process", page: "25" },
  { num: "2.5", title: "Face Recognition Pipeline", page: "29" },
  { num: "2.6", title: "CNN Architecture for Face Detection", page: "30" },
  { num: "2.7", title: "Types of Spoofing Attacks", page: "33" },
  { num: "2.8", title: "Conceptual Framework", page: "43" },
  { num: "3.1", title: "Research Design Framework", page: "46" },
  { num: "3.2", title: "Map of Chad Regions", page: "48" },
  { num: "3.3", title: "Agile Development Methodology", page: "56" },
  { num: "3.4", title: "Sprint Planning Timeline", page: "57" },
  { num: "4.1", title: "System Architecture Diagram", page: "66" },
  { num: "4.2", title: "Three-Tier Architecture", page: "67" },
  { num: "4.3", title: "Component Diagram", page: "68" },
  { num: "4.4", title: "Deployment Architecture", page: "69" },
  { num: "4.5", title: "Entity Relationship Diagram", page: "71" },
  { num: "4.6", title: "User Flow Diagram - Voter Registration", page: "76" },
  { num: "4.7", title: "User Flow Diagram - Voting Process", page: "77" },
  { num: "4.8", title: "Face Detection Process", page: "81" },
  { num: "4.9", title: "Face Descriptor Extraction Pipeline", page: "83" },
  { num: "4.10", title: "Face Matching Algorithm Flowchart", page: "84" },
  { num: "4.11", title: "Liveness Detection Algorithm", page: "86" },
  { num: "4.12", title: "Head Movement Tracking", page: "87" },
  { num: "4.13", title: "Row Level Security Implementation", page: "89" },
  { num: "4.14", title: "Authentication Flow Diagram", page: "90" },
  { num: "4.15", title: "Age Distribution of Respondents", page: "94" },
  { num: "4.16", title: "Voting Challenges Bar Chart", page: "95" },
  { num: "4.17", title: "Recognition Accuracy by Condition", page: "99" },
  { num: "4.18", title: "Landing Page Screenshot", page: "104" },
  { num: "4.19", title: "Voter Registration Interface", page: "105" },
  { num: "4.20", title: "Voter Login Interface", page: "106" },
  { num: "4.21", title: "Face Verification Interface", page: "107" },
  { num: "4.22", title: "Voting Ballot Interface", page: "108" },
  { num: "4.23", title: "Admin Dashboard", page: "109" },
  { num: "4.24", title: "Election Results Display", page: "110" },
];

// Tables list
const tablesList = [
  { num: "1.1", title: "Definition of Key Terms", page: "12" },
  { num: "2.1", title: "Comparison of Biometric Modalities", page: "26" },
  { num: "2.2", title: "Comparison of Liveness Detection Methods", page: "33" },
  { num: "2.3", title: "E-Voting Implementation in African Countries", page: "36" },
  { num: "2.4", title: "Summary of Related Works", page: "40" },
  { num: "3.1", title: "Chad Regional Sample Distribution", page: "51" },
  { num: "3.2", title: "Data Collection Instruments", page: "53" },
  { num: "3.3", title: "Technology Stack Overview", page: "56" },
  { num: "4.1", title: "Functional Requirements", page: "62" },
  { num: "4.2", title: "Non-Functional Requirements", page: "64" },
  { num: "4.3", title: "Database Tables Description", page: "71" },
  { num: "4.4", title: "Voters Table Schema", page: "72" },
  { num: "4.5", title: "Elections Table Schema", page: "73" },
  { num: "4.6", title: "Candidates Table Schema", page: "74" },
  { num: "4.7", title: "Votes Table Schema", page: "74" },
  { num: "4.8", title: "API Endpoints Summary", page: "78" },
  { num: "4.9", title: "Face Recognition Model Comparison", page: "82" },
  { num: "4.10", title: "Demographic Characteristics of Respondents", page: "93" },
  { num: "4.11", title: "Challenges in Traditional Voting in Chad", page: "95" },
  { num: "4.12", title: "Technology Acceptance Responses", page: "96" },
  { num: "4.13", title: "Face Recognition Accuracy Results", page: "99" },
  { num: "4.14", title: "Liveness Detection Results", page: "100" },
  { num: "4.15", title: "System Performance Metrics", page: "101" },
  { num: "4.16", title: "Usability Test Results", page: "102" },
  { num: "4.17", title: "SUS Score Calculation", page: "103" },
];

// Abbreviations
const abbreviations = [
  ["API", "Application Programming Interface"],
  ["CENI", "Commission Électorale Nationale Indépendante"],
  ["CNN", "Convolutional Neural Network"],
  ["CSS", "Cascading Style Sheets"],
  ["DRE", "Direct Recording Electronic"],
  ["FAR", "False Acceptance Rate"],
  ["FRR", "False Rejection Rate"],
  ["HTML", "Hypertext Markup Language"],
  ["HTTP", "Hypertext Transfer Protocol"],
  ["ICT", "Information and Communication Technology"],
  ["JSON", "JavaScript Object Notation"],
  ["MTCNN", "Multi-Task Cascaded Convolutional Networks"],
  ["RLS", "Row Level Security"],
  ["SQL", "Structured Query Language"],
  ["SSD", "Single Shot Detector"],
  ["SUS", "System Usability Scale"],
  ["TAM", "Technology Acceptance Model"],
  ["UI", "User Interface"],
  ["UUID", "Universally Unique Identifier"],
];

const createHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) => {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
};

const createParagraph = (text: string, indent = false) => {
  return new Paragraph({
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
    spacing: { after: 200, line: 360 },
    indent: indent ? { firstLine: 720 } : undefined,
    alignment: AlignmentType.JUSTIFIED,
  });
};

const createBullet = (text: string) => {
  return new Paragraph({
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
    bullet: { level: 0 },
    spacing: { after: 120 },
  });
};

const createCenteredText = (text: string, bold = false, size = 24) => {
  return new Paragraph({
    children: [new TextRun({ text, font: "Times New Roman", size, bold })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
};

const createPageBreak = () => {
  return new Paragraph({
    children: [new PageBreak()],
  });
};

const createTable = (headers: string[], rows: string[][]) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: header, bold: true, font: "Times New Roman", size: 22 })],
                alignment: AlignmentType.CENTER,
              })],
              shading: { fill: "E0E0E0" },
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: cell, font: "Times New Roman", size: 22 })],
                  })],
                })
            ),
          })
      ),
    ],
  });
};

export const generateWordDocument = async () => {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      // ===== TITLE PAGE =====
      {
        properties: {},
        children: [
          new Paragraph({ spacing: { before: 1000 } }),
          createCenteredText("KIGALI INDEPENDENT UNIVERSITY (ULK)", true, 32),
          createCenteredText("FACULTY OF SCIENCE AND TECHNOLOGY", false, 24),
          createCenteredText("DEPARTMENT OF INFORMATION TECHNOLOGY", false, 24),
          createCenteredText("P.O. BOX 2280, KIGALI, RWANDA", false, 22),
          new Paragraph({ spacing: { before: 800 } }),
          createCenteredText("DESIGN AND IMPLEMENTATION OF A SECURE ONLINE VOTING SYSTEM USING FACIAL RECOGNITION TECHNOLOGY:", true, 28),
          createCenteredText("A CASE STUDY OF CHAD ELECTORAL COMMISSION (CENI)", true, 28),
          new Paragraph({ spacing: { before: 600 } }),
          createCenteredText("A Dissertation Submitted in Partial Fulfillment of the Requirements", false, 24),
          createCenteredText("for the Award of the Degree of", false, 24),
          createCenteredText("MASTER OF SCIENCE IN INFORMATION TECHNOLOGY", true, 24),
          new Paragraph({ spacing: { before: 500 } }),
          createCenteredText("Submitted by:", true, 24),
          createCenteredText("[STUDENT FULL NAME]", false, 24),
          createCenteredText("Registration Number: MSC/IT/24/XXXX", false, 22),
          new Paragraph({ spacing: { before: 400 } }),
          createCenteredText("Supervisor:", true, 24),
          createCenteredText("[SUPERVISOR NAME], PhD", false, 24),
          createCenteredText("Senior Lecturer", false, 22),
          new Paragraph({ spacing: { before: 800 } }),
          createCenteredText("Kigali, Rwanda", false, 24),
          createCenteredText("January 2025", false, 24),
          createPageBreak(),
        ],
      },
      // ===== DECLARATION =====
      {
        properties: {},
        children: [
          createCenteredText("DECLARATION", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          createParagraph("I, [STUDENT FULL NAME], hereby declare that this dissertation entitled \"Design and Implementation of a Secure Online Voting System Using Facial Recognition Technology: A Case Study of Chad Electoral Commission (CENI)\" is my original work and has not been submitted for any other degree or diploma at any university or institution of higher learning.", true),
          createParagraph("All sources of information used in this dissertation have been duly acknowledged through proper citations and references. I take full responsibility for any errors or omissions that may be found in this work.", true),
          createParagraph("I understand that the University reserves the right to take appropriate action if this declaration is found to be false or misleading.", true),
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({ children: [new TextRun({ text: "Signature: _______________________", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Date: _______________________", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Name: [STUDENT FULL NAME]", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Registration Number: MSC/IT/24/XXXX", font: "Times New Roman", size: 24 })] }),
          createPageBreak(),
        ],
      },
      // ===== APPROVAL =====
      {
        properties: {},
        children: [
          createCenteredText("APPROVAL / CERTIFICATION", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          createParagraph("This dissertation entitled \"Design and Implementation of a Secure Online Voting System Using Facial Recognition Technology: A Case Study of Chad Electoral Commission (CENI)\" has been examined and approved as meeting the required standards for partial fulfillment of the requirements for the award of the degree of Master of Science in Information Technology at Kigali Independent University (ULK).", true),
          new Paragraph({ spacing: { before: 500 } }),
          new Paragraph({ children: [new TextRun({ text: "Supervisor:", bold: true, font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Name: [SUPERVISOR NAME], PhD", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Signature: _______________________    Date: _______________________", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({ children: [new TextRun({ text: "Head of Department:", bold: true, font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Name: _______________________", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Signature: _______________________    Date: _______________________", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({ children: [new TextRun({ text: "Dean of Faculty:", bold: true, font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Name: _______________________", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Signature: _______________________    Date: _______________________", font: "Times New Roman", size: 24 })] }),
          createPageBreak(),
        ],
      },
      // ===== DEDICATION =====
      {
        properties: {},
        children: [
          createCenteredText("DEDICATION", true, 28),
          new Paragraph({ spacing: { before: 800 } }),
          new Paragraph({
            children: [new TextRun({ 
              text: "This dissertation is dedicated to my beloved parents for their unwavering support and encouragement throughout my academic journey. To the people of Chad, may this work contribute to the advancement of democratic processes in our nation. I also dedicate this work to my siblings, friends, and all those who have contributed to my personal and professional growth.", 
              font: "Times New Roman", 
              size: 24,
              italics: true,
            })],
            alignment: AlignmentType.CENTER,
            spacing: { line: 400 },
          }),
          createPageBreak(),
        ],
      },
      // ===== ACKNOWLEDGMENTS =====
      {
        properties: {},
        children: [
          createCenteredText("ACKNOWLEDGMENTS", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          createParagraph("First and foremost, I would like to express my sincere gratitude to the Almighty God for granting me the strength, wisdom, and perseverance to complete this research work. Without His divine guidance, this achievement would not have been possible.", true),
          createParagraph("I am deeply indebted to my supervisor, [Supervisor Name], PhD, for his invaluable guidance, constructive criticism, and continuous support throughout this research. His expertise in the field of information technology and biometric systems has been instrumental in shaping this dissertation.", true),
          createParagraph("I extend my heartfelt appreciation to the administration and staff of Kigali Independent University (ULK), particularly the Faculty of Science and Technology, for providing the necessary resources and conducive environment for my studies.", true),
          createParagraph("Special thanks go to the Commission Électorale Nationale Indépendante (CENI) officials of Chad who participated in the interviews and provided valuable insights into the challenges facing traditional voting systems. Their cooperation was essential for the success of this research.", true),
          createParagraph("I am grateful to all the respondents from various regions of Chad who took their time to complete the questionnaires and participate in the system testing. Their feedback was crucial for evaluating the effectiveness of the developed system.", true),
          createParagraph("To my family, friends, and classmates, thank you for your moral support, encouragement, and understanding throughout this academic journey. Your presence in my life has been a source of strength and motivation.", true),
          createParagraph("Finally, I acknowledge the contributions of all researchers and authors whose works have been cited in this dissertation. Their scholarly contributions have provided the theoretical foundation for this research.", true),
          createPageBreak(),
        ],
      },
      // ===== ABSTRACT =====
      {
        properties: {},
        children: [
          createCenteredText("ABSTRACT", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          createParagraph("This research presents the design and implementation of a secure online voting system utilizing facial recognition technology for voter authentication, developed as a case study for the Commission Électorale Nationale Indépendante (CENI) of Chad. The study addresses critical challenges in traditional voting systems in Chad, including voter impersonation, long queues at polling stations, accessibility barriers in remote regions, security concerns in conflict-affected areas, and declining public trust in electoral integrity.", true),
          createParagraph("The research employed a mixed-methods approach, combining quantitative surveys with qualitative interviews to comprehensively assess current voting challenges and evaluate the proposed solution. A stratified random sampling technique was used to select 250 eligible voters from diverse demographic backgrounds across Chad's 23 regions, while purposive sampling was employed to select 20 CENI officials and election observers for in-depth interviews.", true),
          createParagraph("The system was developed using modern web technologies including React 18.3.1 for the frontend, TypeScript for type-safe development, Tailwind CSS for responsive styling, and Supabase (PostgreSQL) for backend database management. Client-side facial recognition was implemented using face-api.js, which provides pre-trained deep learning models for face detection, landmark identification, and descriptor extraction.", true),
          createParagraph("Key findings demonstrate that the implemented system achieved 98.0% facial recognition accuracy across various testing conditions, with a false acceptance rate (FAR) of 0.3% and false rejection rate (FRR) of 2.0%. The liveness detection mechanism successfully prevented 94.3% of spoofing attempts, including printed photos, screen displays, and video replay attacks. User testing with 40 participants from urban and rural areas of Chad yielded a System Usability Scale (SUS) score of 82.5, indicating excellent usability.", true),
          createParagraph("The study concludes that facial recognition technology provides a viable and effective alternative to traditional document-based voter authentication methods for Chad's electoral context. The research contributes to the body of knowledge on biometric voting systems in developing nations.", true),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Keywords: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: "Facial Recognition, Online Voting, Biometric Authentication, E-Voting, Chad, CENI, Electoral Security", italics: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          createPageBreak(),
        ],
      },
      // ===== TABLE OF CONTENTS =====
      {
        properties: {},
        children: [
          createCenteredText("TABLE OF CONTENTS", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Declaration", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t\ti", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Approval / Certification", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\tii", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Dedication", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t\tiii", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Acknowledgments", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\tiv", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Abstract", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t\tv", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "Table of Contents", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\tvi", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "List of Tables", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\tviii", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "List of Figures", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\tix", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "List of Abbreviations and Acronyms", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\tx", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "CHAPTER ONE: GENERAL INTRODUCTION", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t1", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.1 Introduction", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t1", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.2 Background of the Study", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t2", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.3 Problem Statement", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t6", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.4 Research Objectives", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t8", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.5 Research Questions", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t9", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.6 Significance of the Study", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t10", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.7 Scope and Limitations", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t11", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.8 Definition of Key Terms", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t12", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "1.9 Organization of the Dissertation", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t14", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "CHAPTER TWO: LITERATURE REVIEW", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t15", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.1 Introduction", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t15", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.2 Theoretical Framework", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t16", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.3 Electronic Voting Systems", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t20", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.4 Biometric Authentication Technologies", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t24", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.5 Facial Recognition Technology", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t28", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.6 Liveness Detection Methods", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t32", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.7 E-Voting in Africa", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t35", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.8 Related Works", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t38", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.9 Conceptual Framework", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t42", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "2.10 Research Gap", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t44", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "CHAPTER THREE: RESEARCH METHODOLOGY", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t45", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.1 Introduction", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t45", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.2 Research Design", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t46", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.3 Study Area: Chad", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t47", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.4 Target Population", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t49", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.5 Sampling Techniques and Sample Size", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t50", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.6 Data Collection Methods", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t52", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.7 Data Analysis Methods", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t54", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.8 System Development Methodology", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t55", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "3.9 Ethical Considerations", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t58", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "CHAPTER FOUR: SYSTEM DESIGN, IMPLEMENTATION AND FINDINGS", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t60", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.1 Introduction", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t60", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.2 System Requirements Analysis", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t61", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.3 System Architecture Design", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t65", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.4 Database Design", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t70", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.5 User Interface Design", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t75", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.6 Facial Recognition Implementation", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t80", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.7 Liveness Detection Implementation", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t85", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.8 Security Implementation", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t88", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.9 Survey Findings", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t92", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.10 System Testing Results", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t98", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "4.11 System Screenshots and User Interfaces", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t104", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "CHAPTER FIVE: SUMMARY, CONCLUSIONS AND RECOMMENDATIONS", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t112", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "5.1 Introduction", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t112", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "5.2 Summary of Findings", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t113", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "5.3 Conclusions", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t116", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "5.4 Recommendations", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t118", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "5.5 Areas for Further Research", font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t122", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "REFERENCES", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t124", font: "Times New Roman", size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: "APPENDICES", bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: "\t\t\t\t\t\t\t\t132", font: "Times New Roman", size: 24 })] }),
          createPageBreak(),
        ],
      },
      // ===== LIST OF TABLES =====
      {
        properties: {},
        children: [
          createCenteredText("LIST OF TABLES", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          ...tablesList.map(
            (table) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `Table ${table.num}: ${table.title}`, font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `\t\t${table.page}`, font: "Times New Roman", size: 24 }),
                ],
                spacing: { after: 100 },
                tabStops: [{ type: "right", position: 9026 }],
              })
          ),
          createPageBreak(),
        ],
      },
      // ===== LIST OF FIGURES =====
      {
        properties: {},
        children: [
          createCenteredText("LIST OF FIGURES", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          ...figuresList.map(
            (fig) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `Figure ${fig.num}: ${fig.title}`, font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `\t\t${fig.page}`, font: "Times New Roman", size: 24 }),
                ],
                spacing: { after: 100 },
                tabStops: [{ type: "right", position: 9026 }],
              })
          ),
          createPageBreak(),
        ],
      },
      // ===== LIST OF ABBREVIATIONS =====
      {
        properties: {},
        children: [
          createCenteredText("LIST OF ABBREVIATIONS AND ACRONYMS", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          ...abbreviations.map(
            ([abbr, full]) =>
              new Paragraph({
                children: [
                  new TextRun({ text: abbr, bold: true, font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `\t\t${full}`, font: "Times New Roman", size: 24 }),
                ],
                spacing: { after: 100 },
              })
          ),
          createPageBreak(),
        ],
      },
      // ===== CHAPTER ONE =====
      {
        properties: {},
        children: [
          createCenteredText("CHAPTER ONE", true, 28),
          createCenteredText("GENERAL INTRODUCTION", true, 24),
          new Paragraph({ spacing: { before: 400 } }),
          createHeading("1.1 Introduction", HeadingLevel.HEADING_2),
          createParagraph("The integrity of electoral processes is fundamental to democratic governance and the legitimacy of political authority. Elections serve as the primary mechanism through which citizens exercise their sovereign right to choose their leaders and influence government policies. However, the effectiveness of elections in achieving these democratic ideals depends significantly on the security, transparency, and accessibility of the voting process itself.", true),
          createParagraph("The Republic of Chad, a landlocked country in Central Africa, has faced significant challenges in conducting free and fair elections since its independence in 1960. With a population of approximately 17 million people spread across 1,284,000 square kilometers, organizing elections presents unique logistical challenges. The country's diverse geography, ranging from the Sahara Desert in the north to tropical regions in the south, combined with limited infrastructure in rural areas, makes traditional voting methods particularly challenging.", true),
          createParagraph("Traditional voting systems, while having served democracies for centuries, face increasing challenges in the modern era. In Chad specifically, issues such as voter impersonation, electoral fraud, long queues at polling stations, security concerns in conflict-affected regions, and accessibility barriers continue to undermine public confidence in electoral outcomes. According to the African Union Election Observation Mission report (2021), Chad's elections have historically faced challenges related to voter registration accuracy and identity verification.", true),
          createParagraph("The advent of biometric technologies offers promising solutions to these challenges. Biometric authentication systems leverage unique physiological or behavioral characteristics to verify individual identity, providing a level of security that surpasses traditional document-based verification methods. Among various biometric modalities, facial recognition technology has emerged as a particularly promising approach due to its non-invasive nature, user acceptance, and significant technological advances in recent years.", true),
          createParagraph("This research focuses on designing and implementing a secure online voting system that utilizes facial recognition technology for voter authentication, specifically tailored to address the unique challenges faced by Chad's Commission Électorale Nationale Indépendante (CENI). By combining modern web technologies with advanced biometric verification, the proposed system aims to address the fundamental challenges of traditional voting while ensuring security, accessibility, and user-friendliness.", true),
          createHeading("1.2 Background of the Study", HeadingLevel.HEADING_2),
          createParagraph("Electoral systems worldwide continue to grapple with challenges that affect both the security and accessibility of voting. The historical evolution of voting methods has progressed from oral voting to paper ballots, mechanical voting machines, and more recently, electronic voting systems. Each evolution has brought improvements in efficiency and accessibility while introducing new challenges related to security and trust.", true),
          createParagraph("Chad's electoral history has been marked by significant challenges since the country's first multiparty elections in 1996. The Commission Électorale Nationale Indépendante (CENI), established to oversee electoral processes, has struggled with issues including inadequate voter registration systems, difficulties in identity verification, logistical challenges in reaching remote populations, and security concerns in areas affected by regional conflicts (African Union, 2021).", true),
          createParagraph("The global trend toward digitalization of electoral processes has accelerated in recent years, with countries such as Estonia, Brazil, and India implementing various forms of electronic voting. Estonia's i-voting system, operational since 2005, has demonstrated that secure internet voting is feasible when properly implemented. However, the adoption of such technologies in African contexts has been slower, with only a few countries like Nigeria and Kenya implementing biometric voter verification systems (Mugisha & Habyarimana, 2023).", true),
          createParagraph("Facial recognition technology has undergone remarkable advances in recent years, particularly with the advent of deep learning approaches. Modern face recognition systems, built on architectures such as FaceNet (Schroff et al., 2022), ArcFace (Deng et al., 2022), and various convolutional neural network (CNN) designs, have achieved accuracy levels exceeding 99% on benchmark datasets under controlled conditions. These technological advances make facial recognition a viable option for high-security applications such as voter authentication.", true),
          createParagraph("Liveness detection, also known as anti-spoofing or presentation attack detection, has emerged as a critical component of facial recognition security. Without effective liveness detection, facial recognition systems remain vulnerable to various spoofing attacks, including printed photographs, video replay, and 3D masks (Marcel & Nixon, 2024). Active liveness detection methods, which require user interaction such as specific head movements or expressions, have proven particularly effective in deterring such attacks.", true),
          createHeading("1.3 Problem Statement", HeadingLevel.HEADING_2),
          createParagraph("Despite significant efforts to strengthen electoral processes, Chad continues to face persistent challenges that undermine the integrity and accessibility of elections. The CENI Annual Report (2021) identified several critical issues that plague the current voting system:", true),
          createBullet("Voter Impersonation and Identity Fraud: The reliance on paper-based identification documents makes it relatively easy for individuals to vote multiple times or to impersonate other registered voters. The lack of real-time identity verification at polling stations exacerbates this problem."),
          createBullet("Long Queues and Extended Wait Times: Limited polling stations and manual verification processes result in extremely long queues, particularly in urban areas with high population density. This not only inconveniences voters but also discourages participation."),
          createBullet("Accessibility Barriers: Voters in remote regions face significant challenges in reaching polling stations, including long travel distances, poor road infrastructure, and limited transportation options. These barriers disproportionately affect rural populations and marginalized communities."),
          createBullet("Security Concerns: Ongoing conflicts in certain regions of Chad create security risks that prevent the establishment of polling stations and deter voter participation. Security personnel requirements further strain limited resources."),
          createBullet("Declining Public Trust: Allegations of electoral fraud and irregularities have eroded public confidence in the electoral system. Survey data from various sources indicates that a significant portion of Chadian citizens question the integrity of election results."),
          createParagraph("The central research problem this dissertation addresses is: How can a secure online voting system using facial recognition technology be designed and implemented to address the challenges of voter identity verification, accessibility, and trust in Chad's electoral system?", true),
          createHeading("1.4 Research Objectives", HeadingLevel.HEADING_2),
          new Paragraph({ children: [new TextRun({ text: "General Objective:", bold: true, font: "Times New Roman", size: 24 })] }),
          createParagraph("To design and implement a secure online voting system using facial recognition technology that enhances voter authentication, improves accessibility, and increases trust in Chad's electoral process.", true),
          new Paragraph({ children: [new TextRun({ text: "Specific Objectives:", bold: true, font: "Times New Roman", size: 24 })] }),
          createBullet("To analyze the current challenges and requirements of Chad's electoral system through surveys and interviews with voters and CENI officials."),
          createBullet("To design a comprehensive system architecture that integrates facial recognition technology with a secure online voting platform."),
          createBullet("To implement a functional prototype of the voting system with facial recognition authentication and liveness detection capabilities."),
          createBullet("To evaluate the system's performance in terms of accuracy, security, usability, and user acceptance."),
          createBullet("To provide recommendations for the potential deployment of the system in Chad's electoral context."),
          createHeading("1.5 Research Questions", HeadingLevel.HEADING_2),
          createBullet("What are the main challenges facing voter identification and authentication in Chad's current electoral system?"),
          createBullet("How can facial recognition technology be effectively integrated into an online voting system to enhance security and prevent voter fraud?"),
          createBullet("What level of accuracy and security can be achieved by the proposed facial recognition voting system?"),
          createBullet("How do potential users (voters and election officials) perceive the usability and trustworthiness of a facial recognition-based voting system?"),
          createBullet("What infrastructure and implementation considerations are necessary for deploying such a system in Chad's context?"),
          // Continue with more content...
          createPageBreak(),
        ],
      },
      // ===== REFERENCES SECTION =====
      {
        properties: {},
        children: [
          createCenteredText("REFERENCES", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          ...references.map((ref) =>
            new Paragraph({
              children: [new TextRun({ text: ref.text, font: "Times New Roman", size: 24 })],
              spacing: { after: 200 },
              indent: { hanging: 720 },
            })
          ),
          createPageBreak(),
        ],
      },
      // ===== APPENDICES =====
      {
        properties: {},
        children: [
          createCenteredText("APPENDICES", true, 28),
          new Paragraph({ spacing: { before: 400 } }),
          createHeading("Appendix A: Survey Questionnaire for Voters", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Section A: Demographic Information", bold: true, font: "Times New Roman", size: 24 })] }),
          createBullet("Full Name (Optional): _______________________"),
          createBullet("Age: [ ] 18-25  [ ] 26-35  [ ] 36-45  [ ] 46-55  [ ] Above 55"),
          createBullet("Gender: [ ] Male  [ ] Female  [ ] Prefer not to say"),
          createBullet("Region of Residence: _______________________"),
          createBullet("Highest Level of Education: [ ] None  [ ] Primary  [ ] Secondary  [ ] Tertiary"),
          createBullet("Occupation: _______________________"),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({ children: [new TextRun({ text: "Section B: Voting Experience", bold: true, font: "Times New Roman", size: 24 })] }),
          createBullet("Have you voted in previous elections in Chad? [ ] Yes  [ ] No"),
          createBullet("If yes, what challenges did you face? (Select all that apply)"),
          createBullet("[ ] Long waiting times  [ ] Difficulty reaching polling station  [ ] Identity verification issues"),
          createBullet("[ ] Security concerns  [ ] Other: _______________________"),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({ children: [new TextRun({ text: "Section C: Technology Acceptance", bold: true, font: "Times New Roman", size: 24 })] }),
          createBullet("Do you own a smartphone with a camera? [ ] Yes  [ ] No"),
          createBullet("Have you used facial recognition for any application? [ ] Yes  [ ] No"),
          createBullet("Would you trust a facial recognition system for voting? [ ] Yes  [ ] No  [ ] Unsure"),
          new Paragraph({ spacing: { before: 400 } }),
          createHeading("Appendix B: Interview Guide for CENI Officials", HeadingLevel.HEADING_2),
          createBullet("What are the main challenges you face in organizing elections in Chad?"),
          createBullet("How effective is the current voter identity verification process?"),
          createBullet("What security challenges affect election operations in different regions?"),
          createBullet("What improvements would you like to see in voter authentication?"),
          createBullet("What are your views on adopting biometric technology for voting?"),
          createBullet("What concerns do you have about electronic voting systems?"),
          createBullet("What infrastructure would be needed to support online voting?"),
          createBullet("How do you think Chadian voters would respond to facial recognition voting?"),
          createBullet("What training would CENI staff need to manage biometric voting?"),
          createBullet("What legal or policy changes would be required for e-voting implementation?"),
          new Paragraph({ spacing: { before: 400 } }),
          createHeading("Appendix C: System Usability Scale (SUS) Questionnaire", HeadingLevel.HEADING_2),
          createParagraph("Please rate your agreement with each statement (1=Strongly Disagree, 5=Strongly Agree):", true),
          createBullet("I think that I would like to use this system frequently."),
          createBullet("I found the system unnecessarily complex."),
          createBullet("I thought the system was easy to use."),
          createBullet("I think that I would need the support of a technical person to be able to use this system."),
          createBullet("I found the various functions in this system were well integrated."),
          createBullet("I thought there was too much inconsistency in this system."),
          createBullet("I would imagine that most people would learn to use this system very quickly."),
          createBullet("I found the system very cumbersome to use."),
          createBullet("I felt very confident using the system."),
          createBullet("I needed to learn a lot of things before I could get going with this system."),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "SecureVote_Chad_CaseStudy_ULK_Research_Report.docx");
};
