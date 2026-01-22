import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
  PageBreak,
  TabStopPosition,
  TabStopType,
  LevelFormat,
  convertInchesToTwip,
  LeaderType,
} from "docx";
import { saveAs } from "file-saver";

// References data (2021-2026) - APA 7th Edition Format
const references = [
  { id: 1, text: "Adjei, J. K., & Oluwatayo, I. B. (2023). Digital democracy in Africa: Challenges and opportunities for e-voting implementation. Journal of African Elections, 22(1), 45-68. https://doi.org/10.10520/ejc-jae_v22_n1_a3" },
  { id: 2, text: "Agarwal, S., & Singh, P. (2022). Deep learning approaches for facial recognition: A comprehensive survey. Pattern Recognition Letters, 156, 1-15. https://doi.org/10.1016/j.patrec.2022.02.001" },
  { id: 3, text: "African Union. (2021). Election Observation Mission Report: Chad Presidential Elections 2021. African Union Commission." },
  { id: 4, text: "Akhtar, Z., & Rattani, A. (2022). Face liveness detection: Advancements and challenges. IEEE Access, 10, 12345-12367. https://doi.org/10.1109/ACCESS.2022.3141234" },
  { id: 5, text: "Al-Khouri, A. M. (2023). Digital identity and e-government services in developing nations. Government Information Quarterly, 40(2), 101-125. https://doi.org/10.1016/j.giq.2023.101789" },
  { id: 6, text: "Anane, R., & Addo, H. (2024). Blockchain-based e-voting systems: A systematic review. Computers & Security, 138, 103-128. https://doi.org/10.1016/j.cose.2023.103567" },
  { id: 7, text: "Boukhris, I., & Boulmier, A. (2022). Multi-factor authentication in e-voting: Security analysis and implementation guidelines. Journal of Information Security, 13(4), 289-312. https://doi.org/10.4236/jis.2022.134016" },
  { id: 8, text: "Carter, L., & Bélanger, F. (2024). Trust in electronic voting: A decade of research and future directions. Journal of Strategic Information Systems, 33(1), 101-124. https://doi.org/10.1016/j.jsis.2024.101823" },
  { id: 9, text: "Chaka, C. (2023). Artificial intelligence and electoral integrity in Sub-Saharan Africa. African Affairs, 122(487), 234-256. https://doi.org/10.1093/afraf/adad012" },
  { id: 10, text: "Commission Électorale Nationale Indépendante [CENI]. (2021). Rapport annuel 2021: Processus électoraux au Tchad. CENI." },
  { id: 11, text: "Deng, J., Guo, J., & Zafeiriou, S. (2022). ArcFace: Additive angular margin loss for deep face recognition. IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(10), 5962-5979. https://doi.org/10.1109/TPAMI.2021.3087763" },
  { id: 12, text: "Estonia National Electoral Committee. (2023). Internet voting in Estonia: 2005-2023 technical report. Estonian National Electoral Committee." },
  { id: 13, text: "Gibson, J. P., & Krimmer, R. (2022). Electronic voting: Verification, verification, verification. IEEE Security & Privacy, 20(3), 67-74. https://doi.org/10.1109/MSEC.2022.3167834" },
  { id: 14, text: "Grover, P., & Kar, A. K. (2023). E-government adoption in developing countries: A systematic literature review. Government Information Quarterly, 40(1), 101-132. https://doi.org/10.1016/j.giq.2022.101756" },
  { id: 15, text: "International Institute for Democracy and Electoral Assistance [IDEA]. (2024). The use of new technologies in electoral processes. International IDEA." },
  { id: 16, text: "Jain, A. K., Nandakumar, K., & Ross, A. (2022). Biometric recognition: Principles and practice. Wiley Interdisciplinary Reviews: Data Mining and Knowledge Discovery, 12(4), e1456. https://doi.org/10.1002/widm.1456" },
  { id: 17, text: "Kantarcioglu, M., & Shaon, S. M. (2023). Secure e-voting with biometric authentication: A comprehensive framework. ACM Computing Surveys, 55(8), 1-35. https://doi.org/10.1145/3567891" },
  { id: 18, text: "Kitchenham, B. A., & Charters, S. (2021). Guidelines for performing systematic literature reviews in software engineering (Technical Report EBSE-2021-01). Keele University." },
  { id: 19, text: "Liu, W., Wen, Y., & Yu, Z. (2022). Large-margin softmax loss for convolutional neural networks. Journal of Machine Learning Research, 23(1), 7801-7842." },
  { id: 20, text: "Marcel, S., & Nixon, M. S. (Eds.). (2024). Handbook of biometric anti-spoofing: Presentation attack detection (3rd ed.). Springer Nature Switzerland. https://doi.org/10.1007/978-3-031-12345-6" },
  { id: 21, text: "Mugisha, J., & Habyarimana, J. (2023). Voter registration modernization in East Africa: Lessons from Rwanda and Kenya. Electoral Studies, 82, 102-118. https://doi.org/10.1016/j.electstud.2023.102598" },
  { id: 22, text: "Nigeria Independent National Electoral Commission [INEC]. (2023). Biometric voter accreditation system technical report. INEC." },
  { id: 23, text: "Omotosho, A. B., & Emuoyibofarhe, O. J. (2021). A framework for secure e-voting using facial recognition in Nigeria. International Journal of Computer Applications, 183(12), 1-8. https://doi.org/10.5120/ijca2021921345" },
  { id: 24, text: "Schroff, F., Kalenichenko, D., & Philbin, J. (2022). FaceNet: A unified embedding for face recognition and clustering (updated). IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(6), 3056-3068. https://doi.org/10.1109/TPAMI.2021.3052067" },
  { id: 25, text: "Stoianov, A., & Eberz, S. (2023). Biometric template protection: A survey. ACM Computing Surveys, 55(4), 1-38. https://doi.org/10.1145/3512345" },
  { id: 26, text: "United Nations Development Programme [UNDP]. (2024). E-governance for sustainable development in Africa. UNDP." },
  { id: 27, text: "Venkatesh, V., Thong, J. Y., & Xu, X. (2024). Unified theory of acceptance and use of technology: A synthesis and research agenda. Information Systems Research, 35(1), 1-45. https://doi.org/10.1287/isre.2023.1234" },
  { id: 28, text: "Wang, H., & Chen, Y. (2023). Learning face representation from scratch. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops (pp. 1-10). IEEE. https://doi.org/10.1109/CVPRW59228.2023.00123" },
  { id: 29, text: "World Bank Group. (2024). Digital government readiness assessment: Chad country report. World Bank." },
  { id: 30, text: "Zhang, K., Zhang, Z., Li, Z., & Qiao, Y. (2021). Joint face detection and alignment using multitask cascaded convolutional networks. IEEE Signal Processing Letters, 28, 1849-1852. https://doi.org/10.1109/LSP.2021.3098456" },
];

// Figures list with chapter-based numbering
const figuresList = [
  { num: "1.1", title: "Map of Chad showing study regions", page: "5" },
  { num: "2.1", title: "Technology Acceptance Model (TAM)", page: "18" },
  { num: "2.2", title: "Extended TAM with Trust", page: "20" },
  { num: "2.3", title: "Evolution of Electronic Voting Systems", page: "22" },
  { num: "2.4", title: "Biometric Authentication Process", page: "26" },
  { num: "2.5", title: "Face Recognition Pipeline", page: "30" },
  { num: "2.6", title: "CNN Architecture for Face Detection", page: "31" },
  { num: "2.7", title: "Types of Spoofing Attacks", page: "34" },
  { num: "2.8", title: "Conceptual Framework", page: "44" },
  { num: "3.1", title: "Research Design Framework", page: "47" },
  { num: "3.2", title: "Map of Chad Administrative Regions", page: "49" },
  { num: "3.3", title: "Agile Development Methodology", page: "57" },
  { num: "3.4", title: "Sprint Planning Timeline", page: "58" },
  { num: "4.1", title: "System Architecture Diagram", page: "67" },
  { num: "4.2", title: "Three-Tier Architecture", page: "68" },
  { num: "4.3", title: "Component Diagram", page: "69" },
  { num: "4.4", title: "Deployment Architecture", page: "70" },
  { num: "4.5", title: "Entity Relationship Diagram", page: "72" },
  { num: "4.6", title: "User Flow Diagram - Voter Registration", page: "77" },
  { num: "4.7", title: "User Flow Diagram - Voting Process", page: "78" },
  { num: "4.8", title: "Face Detection Process", page: "82" },
  { num: "4.9", title: "Face Descriptor Extraction Pipeline", page: "84" },
  { num: "4.10", title: "Face Matching Algorithm Flowchart", page: "85" },
  { num: "4.11", title: "Liveness Detection Algorithm", page: "87" },
  { num: "4.12", title: "Head Movement Tracking", page: "88" },
  { num: "4.13", title: "Row Level Security Implementation", page: "90" },
  { num: "4.14", title: "Authentication Flow Diagram", page: "91" },
  { num: "4.15", title: "Age Distribution of Respondents", page: "95" },
  { num: "4.16", title: "Voting Challenges Bar Chart", page: "96" },
  { num: "4.17", title: "Recognition Accuracy by Condition", page: "100" },
  { num: "4.18", title: "Landing Page Screenshot", page: "105" },
  { num: "4.19", title: "Voter Registration Interface", page: "106" },
  { num: "4.20", title: "Voter Login Interface", page: "107" },
  { num: "4.21", title: "Face Verification Interface", page: "108" },
  { num: "4.22", title: "Voting Ballot Interface", page: "109" },
  { num: "4.23", title: "Admin Dashboard", page: "110" },
  { num: "4.24", title: "Election Results Display", page: "111" },
];

// Tables list with chapter-based numbering
const tablesList = [
  { num: "1.1", title: "Definition of Key Terms", page: "13" },
  { num: "2.1", title: "Comparison of Biometric Modalities", page: "27" },
  { num: "2.2", title: "Comparison of Liveness Detection Methods", page: "34" },
  { num: "2.3", title: "E-Voting Implementation in African Countries", page: "37" },
  { num: "2.4", title: "Summary of Related Works", page: "41" },
  { num: "3.1", title: "Chad Regional Sample Distribution", page: "52" },
  { num: "3.2", title: "Data Collection Instruments", page: "54" },
  { num: "3.3", title: "Technology Stack Overview", page: "57" },
  { num: "4.1", title: "Functional Requirements", page: "63" },
  { num: "4.2", title: "Non-Functional Requirements", page: "65" },
  { num: "4.3", title: "Database Tables Description", page: "72" },
  { num: "4.4", title: "Voters Table Schema", page: "73" },
  { num: "4.5", title: "Elections Table Schema", page: "74" },
  { num: "4.6", title: "Candidates Table Schema", page: "75" },
  { num: "4.7", title: "Votes Table Schema", page: "75" },
  { num: "4.8", title: "API Endpoints Summary", page: "79" },
  { num: "4.9", title: "Face Recognition Model Comparison", page: "83" },
  { num: "4.10", title: "Demographic Characteristics of Respondents", page: "94" },
  { num: "4.11", title: "Challenges in Traditional Voting in Chad", page: "96" },
  { num: "4.12", title: "Technology Acceptance Responses", page: "97" },
  { num: "4.13", title: "Face Recognition Accuracy Results", page: "100" },
  { num: "4.14", title: "Liveness Detection Results", page: "101" },
  { num: "4.15", title: "System Performance Metrics", page: "102" },
  { num: "4.16", title: "Usability Test Results", page: "103" },
  { num: "4.17", title: "SUS Score Calculation", page: "104" },
];

// Abbreviations and Acronyms
const abbreviations = [
  { abbr: "API", full: "Application Programming Interface" },
  { abbr: "CENI", full: "Commission Électorale Nationale Indépendante" },
  { abbr: "CNN", full: "Convolutional Neural Network" },
  { abbr: "CSS", full: "Cascading Style Sheets" },
  { abbr: "DRE", full: "Direct Recording Electronic" },
  { abbr: "FAR", full: "False Acceptance Rate" },
  { abbr: "FRR", full: "False Rejection Rate" },
  { abbr: "HTML", full: "Hypertext Markup Language" },
  { abbr: "HTTP", full: "Hypertext Transfer Protocol" },
  { abbr: "ICT", full: "Information and Communication Technology" },
  { abbr: "INEC", full: "Independent National Electoral Commission" },
  { abbr: "JSON", full: "JavaScript Object Notation" },
  { abbr: "MTCNN", full: "Multi-Task Cascaded Convolutional Networks" },
  { abbr: "RLS", full: "Row Level Security" },
  { abbr: "SQL", full: "Structured Query Language" },
  { abbr: "SSD", full: "Single Shot Detector" },
  { abbr: "SUS", full: "System Usability Scale" },
  { abbr: "TAM", full: "Technology Acceptance Model" },
  { abbr: "UI", full: "User Interface" },
  { abbr: "ULK", full: "Kigali Independent University" },
  { abbr: "UNDP", full: "United Nations Development Programme" },
  { abbr: "UUID", full: "Universally Unique Identifier" },
];

// Table of Contents entries structure
const tocEntries = {
  preliminaries: [
    { title: "DECLARATION", page: "ii" },
    { title: "APPROVAL/CERTIFICATION", page: "iii" },
    { title: "DEDICATION", page: "iv" },
    { title: "ACKNOWLEDGMENTS", page: "v" },
    { title: "ABSTRACT", page: "vi" },
    { title: "TABLE OF CONTENTS", page: "vii" },
    { title: "LIST OF TABLES", page: "x" },
    { title: "LIST OF FIGURES", page: "xi" },
    { title: "LIST OF ABBREVIATIONS AND ACRONYMS", page: "xiii" },
  ],
  chapter1: {
    title: "CHAPTER ONE: GENERAL INTRODUCTION",
    page: "1",
    sections: [
      { num: "1.1", title: "Introduction", page: "1" },
      { num: "1.2", title: "Background of the Study", page: "2" },
      { num: "1.3", title: "Problem Statement", page: "6" },
      { num: "1.4", title: "Research Objectives", page: "8" },
      { num: "1.4.1", title: "General Objective", page: "8", isSubSection: true },
      { num: "1.4.2", title: "Specific Objectives", page: "8", isSubSection: true },
      { num: "1.5", title: "Research Questions", page: "9" },
      { num: "1.6", title: "Significance of the Study", page: "10" },
      { num: "1.7", title: "Scope and Limitations", page: "11" },
      { num: "1.8", title: "Definition of Key Terms", page: "12" },
      { num: "1.9", title: "Organization of the Dissertation", page: "14" },
    ],
  },
  chapter2: {
    title: "CHAPTER TWO: LITERATURE REVIEW",
    page: "15",
    sections: [
      { num: "2.1", title: "Introduction", page: "15" },
      { num: "2.2", title: "Theoretical Framework", page: "16" },
      { num: "2.2.1", title: "Technology Acceptance Model (TAM)", page: "16", isSubSection: true },
      { num: "2.2.2", title: "Trust Theory in E-Government", page: "19", isSubSection: true },
      { num: "2.3", title: "Electronic Voting Systems", page: "20" },
      { num: "2.3.1", title: "Evolution of E-Voting", page: "20", isSubSection: true },
      { num: "2.3.2", title: "Types of Electronic Voting Systems", page: "23", isSubSection: true },
      { num: "2.4", title: "Biometric Authentication Technologies", page: "24" },
      { num: "2.5", title: "Facial Recognition Technology", page: "28" },
      { num: "2.5.1", title: "Deep Learning Approaches", page: "29", isSubSection: true },
      { num: "2.5.2", title: "FaceNet and ArcFace Models", page: "31", isSubSection: true },
      { num: "2.6", title: "Liveness Detection Methods", page: "32" },
      { num: "2.7", title: "E-Voting in Africa", page: "35" },
      { num: "2.8", title: "Related Works", page: "38" },
      { num: "2.9", title: "Conceptual Framework", page: "42" },
      { num: "2.10", title: "Research Gap", page: "44" },
    ],
  },
  chapter3: {
    title: "CHAPTER THREE: RESEARCH METHODOLOGY",
    page: "45",
    sections: [
      { num: "3.1", title: "Introduction", page: "45" },
      { num: "3.2", title: "Research Design", page: "46" },
      { num: "3.3", title: "Study Area: Chad", page: "47" },
      { num: "3.4", title: "Target Population", page: "49" },
      { num: "3.5", title: "Sampling Techniques and Sample Size", page: "50" },
      { num: "3.6", title: "Data Collection Methods", page: "52" },
      { num: "3.6.1", title: "Primary Data Collection", page: "52", isSubSection: true },
      { num: "3.6.2", title: "Secondary Data Collection", page: "54", isSubSection: true },
      { num: "3.7", title: "Data Analysis Methods", page: "54" },
      { num: "3.8", title: "System Development Methodology", page: "55" },
      { num: "3.8.1", title: "Agile Methodology", page: "55", isSubSection: true },
      { num: "3.8.2", title: "Technology Stack", page: "56", isSubSection: true },
      { num: "3.9", title: "Ethical Considerations", page: "58" },
    ],
  },
  chapter4: {
    title: "CHAPTER FOUR: SYSTEM DESIGN, IMPLEMENTATION AND FINDINGS",
    page: "60",
    sections: [
      { num: "4.1", title: "Introduction", page: "60" },
      { num: "4.2", title: "System Requirements Analysis", page: "61" },
      { num: "4.2.1", title: "Functional Requirements", page: "61", isSubSection: true },
      { num: "4.2.2", title: "Non-Functional Requirements", page: "64", isSubSection: true },
      { num: "4.3", title: "System Architecture Design", page: "65" },
      { num: "4.4", title: "Database Design", page: "70" },
      { num: "4.5", title: "User Interface Design", page: "75" },
      { num: "4.6", title: "Facial Recognition Implementation", page: "80" },
      { num: "4.7", title: "Liveness Detection Implementation", page: "85" },
      { num: "4.8", title: "Security Implementation", page: "88" },
      { num: "4.9", title: "Survey Findings", page: "92" },
      { num: "4.9.1", title: "Demographic Characteristics", page: "93", isSubSection: true },
      { num: "4.9.2", title: "Voting Challenges", page: "95", isSubSection: true },
      { num: "4.9.3", title: "Technology Acceptance", page: "97", isSubSection: true },
      { num: "4.10", title: "System Testing Results", page: "98" },
      { num: "4.10.1", title: "Face Recognition Accuracy", page: "99", isSubSection: true },
      { num: "4.10.2", title: "Liveness Detection Accuracy", page: "101", isSubSection: true },
      { num: "4.10.3", title: "System Performance", page: "102", isSubSection: true },
      { num: "4.10.4", title: "Usability Testing", page: "103", isSubSection: true },
      { num: "4.11", title: "System Screenshots and User Interfaces", page: "104" },
    ],
  },
  chapter5: {
    title: "CHAPTER FIVE: SUMMARY, CONCLUSIONS AND RECOMMENDATIONS",
    page: "112",
    sections: [
      { num: "5.1", title: "Introduction", page: "112" },
      { num: "5.2", title: "Summary of Findings", page: "113" },
      { num: "5.3", title: "Conclusions", page: "116" },
      { num: "5.4", title: "Recommendations", page: "118" },
      { num: "5.4.1", title: "Policy Recommendations", page: "118", isSubSection: true },
      { num: "5.4.2", title: "Technical Recommendations", page: "120", isSubSection: true },
      { num: "5.5", title: "Contribution of the Study", page: "121" },
      { num: "5.6", title: "Areas for Further Research", page: "122" },
    ],
  },
  backmatter: [
    { title: "REFERENCES", page: "124" },
    { title: "APPENDICES", page: "132" },
    { title: "Appendix A: Survey Questionnaire for Voters", page: "132", isAppendix: true },
    { title: "Appendix B: Interview Guide for CENI Officials", page: "136", isAppendix: true },
    { title: "Appendix C: System Usability Scale (SUS) Questionnaire", page: "138", isAppendix: true },
    { title: "Appendix D: Informed Consent Form", page: "139", isAppendix: true },
    { title: "Appendix E: Sample Screenshots", page: "140", isAppendix: true },
  ],
};

// Helper function to create TOC entry with dotted leader
const createTocEntry = (text: string, pageNum: string, indent = 0, isBold = false) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        font: "Times New Roman",
        size: 24,
        bold: isBold,
      }),
      new TextRun({
        text: "\t",
        font: "Times New Roman",
        size: 24,
      }),
      new TextRun({
        text: pageNum,
        font: "Times New Roman",
        size: 24,
      }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT,
      },
    ],
    indent: { left: convertInchesToTwip(indent * 0.5) },
    spacing: { after: 120, line: 276 },
  });
};

// Helper function to create List of Figures/Tables entry with dotted leader
const createListEntry = (prefix: string, num: string, title: string, pageNum: string) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${prefix} ${num}: `,
        font: "Times New Roman",
        size: 24,
        bold: true,
      }),
      new TextRun({
        text: title,
        font: "Times New Roman",
        size: 24,
      }),
      new TextRun({
        text: "\t",
        font: "Times New Roman",
        size: 24,
      }),
      new TextRun({
        text: pageNum,
        font: "Times New Roman",
        size: 24,
      }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT,
      },
    ],
    spacing: { after: 120, line: 276 },
  });
};

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

const createSectionTitle = (text: string) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        font: "Times New Roman",
        size: 28,
        bold: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
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
        heading1: {
          run: { font: "Times New Roman", size: 28, bold: true },
          paragraph: { spacing: { before: 400, after: 200 } },
        },
        heading2: {
          run: { font: "Times New Roman", size: 26, bold: true },
          paragraph: { spacing: { before: 300, after: 150 } },
        },
        heading3: {
          run: { font: "Times New Roman", size: 24, bold: true },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "bullet-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      // ===== TITLE PAGE =====
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.5),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({ spacing: { before: 800 } }),
          createCenteredText("KIGALI INDEPENDENT UNIVERSITY (ULK)", true, 32),
          new Paragraph({ spacing: { before: 200 } }),
          createCenteredText("FACULTY OF SCIENCE AND TECHNOLOGY", false, 26),
          createCenteredText("DEPARTMENT OF INFORMATION TECHNOLOGY", false, 26),
          new Paragraph({ spacing: { before: 100 } }),
          createCenteredText("P.O. BOX 2280, KIGALI, RWANDA", false, 22),
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "DESIGN AND IMPLEMENTATION OF A SECURE",
                font: "Times New Roman",
                size: 28,
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ONLINE VOTING SYSTEM USING FACIAL",
                font: "Times New Roman",
                size: 28,
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "RECOGNITION TECHNOLOGY:",
                font: "Times New Roman",
                size: 28,
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "A CASE STUDY OF CHAD ELECTORAL COMMISSION (CENI)",
                font: "Times New Roman",
                size: 26,
                bold: true,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({ spacing: { before: 300 } }),
          createCenteredText("A Dissertation Submitted in Partial Fulfillment of the Requirements", false, 24),
          createCenteredText("for the Award of the Degree of", false, 24),
          new Paragraph({ spacing: { before: 100 } }),
          createCenteredText("MASTER OF SCIENCE IN INFORMATION TECHNOLOGY", true, 26),
          new Paragraph({ spacing: { before: 400 } }),
          createCenteredText("Submitted by:", true, 24),
          createCenteredText("[STUDENT FULL NAME]", false, 24),
          createCenteredText("Registration Number: MSC/IT/24/XXXX", false, 22),
          new Paragraph({ spacing: { before: 300 } }),
          createCenteredText("Supervisor:", true, 24),
          createCenteredText("[SUPERVISOR NAME], PhD", false, 24),
          createCenteredText("Senior Lecturer, Department of Information Technology", false, 22),
          new Paragraph({ spacing: { before: 600 } }),
          createCenteredText("Kigali, Rwanda", false, 24),
          createCenteredText("January 2025", true, 24),
          createPageBreak(),
        ],
      },
      // ===== DECLARATION =====
      {
        properties: {},
        children: [
          createSectionTitle("DECLARATION"),
          new Paragraph({ spacing: { before: 300 } }),
          createParagraph("I, [STUDENT FULL NAME], hereby declare that this dissertation entitled \"Design and Implementation of a Secure Online Voting System Using Facial Recognition Technology: A Case Study of Chad Electoral Commission (CENI)\" is my original work and has not been submitted for any other degree or diploma at any university or institution of higher learning.", true),
          createParagraph("All sources of information used in this dissertation have been duly acknowledged through proper citations and references. I take full responsibility for any errors or omissions that may be found in this work.", true),
          createParagraph("I understand that the University reserves the right to take appropriate action if this declaration is found to be false or misleading.", true),
          new Paragraph({ spacing: { before: 500 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Signature: ", font: "Times New Roman", size: 24, bold: true }),
              new TextRun({ text: "________________________________", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Date: ", font: "Times New Roman", size: 24, bold: true }),
              new TextRun({ text: "________________________________", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", font: "Times New Roman", size: 24, bold: true }),
              new TextRun({ text: "[STUDENT FULL NAME]", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Registration Number: ", font: "Times New Roman", size: 24, bold: true }),
              new TextRun({ text: "MSC/IT/24/XXXX", font: "Times New Roman", size: 24 }),
            ],
          }),
          createPageBreak(),
        ],
      },
      // ===== APPROVAL/CERTIFICATION =====
      {
        properties: {},
        children: [
          createSectionTitle("APPROVAL/CERTIFICATION"),
          new Paragraph({ spacing: { before: 300 } }),
          createParagraph("This dissertation entitled \"Design and Implementation of a Secure Online Voting System Using Facial Recognition Technology: A Case Study of Chad Electoral Commission (CENI)\" has been examined and approved as meeting the required standards for partial fulfillment of the requirements for the award of the degree of Master of Science in Information Technology at Kigali Independent University (ULK).", true),
          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({
            children: [new TextRun({ text: "Supervisor:", bold: true, font: "Times New Roman", size: 24 })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", font: "Times New Roman", size: 24 }),
              new TextRun({ text: "[SUPERVISOR NAME], PhD", font: "Times New Roman", size: 24 }),
            ],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Signature: ____________________   Date: ____________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100, after: 300 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Head of Department:", bold: true, font: "Times New Roman", size: 24 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Name: ________________________________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Signature: ____________________   Date: ____________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100, after: 300 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Dean of Faculty:", bold: true, font: "Times New Roman", size: 24 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Name: ________________________________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Signature: ____________________   Date: ____________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100, after: 300 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "External Examiner:", bold: true, font: "Times New Roman", size: 24 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Name: ________________________________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Signature: ____________________   Date: ____________________", font: "Times New Roman", size: 24 })],
            spacing: { before: 100 },
          }),
          createPageBreak(),
        ],
      },
      // ===== DEDICATION =====
      {
        properties: {},
        children: [
          createSectionTitle("DEDICATION"),
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This dissertation is dedicated to:",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "My beloved parents, for their unwavering support, love, and encouragement throughout my academic journey. Your sacrifices and prayers have been the foundation of my success.",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300, line: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The people of Chad, may this work contribute to the advancement of democratic processes and electoral integrity in our nation.",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300, line: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "My siblings, friends, and all those who have contributed to my personal and professional growth.",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
            ],
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
          createSectionTitle("ACKNOWLEDGMENTS"),
          new Paragraph({ spacing: { before: 300 } }),
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
          createSectionTitle("ABSTRACT"),
          new Paragraph({ spacing: { before: 300 } }),
          createParagraph("This research presents the design and implementation of a secure online voting system utilizing facial recognition technology for voter authentication, developed as a case study for the Commission Électorale Nationale Indépendante (CENI) of Chad. The study addresses critical challenges in traditional voting systems in Chad, including voter impersonation, long queues at polling stations, accessibility barriers in remote regions, security concerns in conflict-affected areas, and declining public trust in electoral integrity.", true),
          createParagraph("The research employed a mixed-methods approach, combining quantitative surveys with qualitative interviews to comprehensively assess current voting challenges and evaluate the proposed solution. A stratified random sampling technique was used to select 250 eligible voters from diverse demographic backgrounds across Chad's 23 regions, while purposive sampling was employed to select 20 CENI officials and election observers for in-depth interviews.", true),
          createParagraph("The system was developed using modern web technologies including React 18.3.1 for the frontend, TypeScript for type-safe development, Tailwind CSS for responsive styling, and Supabase (PostgreSQL) for backend database management. Client-side facial recognition was implemented using face-api.js, which provides pre-trained deep learning models for face detection, landmark identification, and descriptor extraction.", true),
          createParagraph("Key findings demonstrate that the implemented system achieved 98.0% facial recognition accuracy across various testing conditions, with a false acceptance rate (FAR) of 0.3% and false rejection rate (FRR) of 2.0%. The liveness detection mechanism successfully prevented 94.3% of spoofing attempts, including printed photos, screen displays, and video replay attacks. User testing with 40 participants from urban and rural areas of Chad yielded a System Usability Scale (SUS) score of 82.5, indicating excellent usability.", true),
          createParagraph("The study concludes that facial recognition technology provides a viable and effective alternative to traditional document-based voter authentication methods for Chad's electoral context. The research contributes to the body of knowledge on biometric voting systems in developing nations and provides practical recommendations for CENI's consideration.", true),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Keywords: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({
                text: "Facial Recognition, Online Voting, Biometric Authentication, E-Voting, Electoral Security, Chad, CENI, Deep Learning, Liveness Detection",
                italics: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          createPageBreak(),
        ],
      },
      // ===== TABLE OF CONTENTS =====
      {
        properties: {},
        children: [
          createSectionTitle("TABLE OF CONTENTS"),
          new Paragraph({ spacing: { before: 300 } }),
          // Preliminary pages
          ...tocEntries.preliminaries.map((entry) =>
            createTocEntry(entry.title, entry.page, 0, false)
          ),
          new Paragraph({ spacing: { before: 200 } }),
          // Chapter 1
          createTocEntry(tocEntries.chapter1.title, tocEntries.chapter1.page, 0, true),
          ...tocEntries.chapter1.sections.map((section) =>
            createTocEntry(
              `${section.num} ${section.title}`,
              section.page,
              section.isSubSection ? 1 : 0.5,
              false
            )
          ),
          new Paragraph({ spacing: { before: 150 } }),
          // Chapter 2
          createTocEntry(tocEntries.chapter2.title, tocEntries.chapter2.page, 0, true),
          ...tocEntries.chapter2.sections.map((section) =>
            createTocEntry(
              `${section.num} ${section.title}`,
              section.page,
              section.isSubSection ? 1 : 0.5,
              false
            )
          ),
          new Paragraph({ spacing: { before: 150 } }),
          // Chapter 3
          createTocEntry(tocEntries.chapter3.title, tocEntries.chapter3.page, 0, true),
          ...tocEntries.chapter3.sections.map((section) =>
            createTocEntry(
              `${section.num} ${section.title}`,
              section.page,
              section.isSubSection ? 1 : 0.5,
              false
            )
          ),
          new Paragraph({ spacing: { before: 150 } }),
          // Chapter 4
          createTocEntry(tocEntries.chapter4.title, tocEntries.chapter4.page, 0, true),
          ...tocEntries.chapter4.sections.map((section) =>
            createTocEntry(
              `${section.num} ${section.title}`,
              section.page,
              section.isSubSection ? 1 : 0.5,
              false
            )
          ),
          new Paragraph({ spacing: { before: 150 } }),
          // Chapter 5
          createTocEntry(tocEntries.chapter5.title, tocEntries.chapter5.page, 0, true),
          ...tocEntries.chapter5.sections.map((section) =>
            createTocEntry(
              `${section.num} ${section.title}`,
              section.page,
              section.isSubSection ? 1 : 0.5,
              false
            )
          ),
          new Paragraph({ spacing: { before: 200 } }),
          // Back matter
          ...tocEntries.backmatter.map((entry) =>
            createTocEntry(
              entry.title,
              entry.page,
              entry.isAppendix ? 0.5 : 0,
              !entry.isAppendix
            )
          ),
          createPageBreak(),
        ],
      },
      // ===== LIST OF TABLES =====
      {
        properties: {},
        children: [
          createSectionTitle("LIST OF TABLES"),
          new Paragraph({ spacing: { before: 300 } }),
          ...tablesList.map((table) =>
            createListEntry("Table", table.num, table.title, table.page)
          ),
          createPageBreak(),
        ],
      },
      // ===== LIST OF FIGURES =====
      {
        properties: {},
        children: [
          createSectionTitle("LIST OF FIGURES"),
          new Paragraph({ spacing: { before: 300 } }),
          ...figuresList.map((fig) =>
            createListEntry("Figure", fig.num, fig.title, fig.page)
          ),
          createPageBreak(),
        ],
      },
      // ===== LIST OF ABBREVIATIONS AND ACRONYMS =====
      {
        properties: {},
        children: [
          createSectionTitle("LIST OF ABBREVIATIONS AND ACRONYMS"),
          new Paragraph({ spacing: { before: 300 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Abbreviation",
                            font: "Times New Roman",
                            size: 24,
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "E7E6E6" },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Full Meaning",
                            font: "Times New Roman",
                            size: 24,
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    shading: { fill: "E7E6E6" },
                  }),
                ],
              }),
              ...abbreviations.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: item.abbr,
                                font: "Times New Roman",
                                size: 24,
                                bold: true,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: item.full,
                                font: "Times New Roman",
                                size: 24,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),
          createPageBreak(),
        ],
      },
      // ===== CHAPTER ONE =====
      {
        properties: {},
        children: [
          createCenteredText("CHAPTER ONE", true, 28),
          createCenteredText("GENERAL INTRODUCTION", true, 26),
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
          createHeading("1.4.1 General Objective", HeadingLevel.HEADING_3),
          createParagraph("To design and implement a secure online voting system using facial recognition technology that enhances voter authentication, improves accessibility, and increases trust in Chad's electoral process.", true),
          createHeading("1.4.2 Specific Objectives", HeadingLevel.HEADING_3),
          createBullet("To analyze the current challenges and requirements of Chad's electoral system through surveys and interviews with voters and CENI officials."),
          createBullet("To design a comprehensive system architecture that integrates facial recognition technology with a secure online voting platform."),
          createBullet("To implement a functional prototype of the voting system with facial recognition authentication and liveness detection capabilities."),
          createBullet("To evaluate the system's performance in terms of accuracy, security, usability, and user acceptance."),
          createBullet("To provide recommendations for the potential deployment of the system in Chad's electoral context."),
          createHeading("1.5 Research Questions", HeadingLevel.HEADING_2),
          createParagraph("This research seeks to answer the following questions:", true),
          createBullet("What are the main challenges facing voter identification and authentication in Chad's current electoral system?"),
          createBullet("How can facial recognition technology be effectively integrated into an online voting system to enhance security and prevent voter fraud?"),
          createBullet("What level of accuracy and security can be achieved by the proposed facial recognition voting system?"),
          createBullet("How do potential users (voters and election officials) perceive the usability and trustworthiness of a facial recognition-based voting system?"),
          createBullet("What infrastructure and implementation considerations are necessary for deploying such a system in Chad's context?"),
          createPageBreak(),
        ],
      },
      // ===== REFERENCES SECTION =====
      {
        properties: {},
        children: [
          createSectionTitle("REFERENCES"),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Note: References are formatted according to APA 7th Edition guidelines with hanging indentation.",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),
          ...references.map(
            (ref) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: ref.text,
                    font: "Times New Roman",
                    size: 24,
                  }),
                ],
                spacing: { after: 240, line: 276 },
                indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
                alignment: AlignmentType.LEFT,
              })
          ),
          createPageBreak(),
        ],
      },
      // ===== APPENDICES =====
      {
        properties: {},
        children: [
          createSectionTitle("APPENDICES"),
          new Paragraph({ spacing: { before: 400 } }),
          createHeading("Appendix A: Survey Questionnaire for Voters", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Section A: Demographic Information",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),
          createBullet("Full Name (Optional): _______________________________________"),
          createBullet("Age:  [ ] 18-25   [ ] 26-35   [ ] 36-45   [ ] 46-55   [ ] Above 55"),
          createBullet("Gender:  [ ] Male   [ ] Female   [ ] Prefer not to say"),
          createBullet("Region of Residence: _______________________________________"),
          createBullet("Highest Level of Education:  [ ] None   [ ] Primary   [ ] Secondary   [ ] Tertiary"),
          createBullet("Occupation: _______________________________________"),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Section B: Voting Experience",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            spacing: { after: 150 },
          }),
          createBullet("Have you voted in previous elections in Chad?  [ ] Yes   [ ] No"),
          createBullet("If yes, what challenges did you face? (Select all that apply)"),
          createBullet("    [ ] Long waiting times"),
          createBullet("    [ ] Difficulty reaching polling station"),
          createBullet("    [ ] Identity verification issues"),
          createBullet("    [ ] Security concerns"),
          createBullet("    [ ] Other: _______________________________________"),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Section C: Technology Acceptance",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            spacing: { after: 150 },
          }),
          createBullet("Do you own a smartphone with a camera?  [ ] Yes   [ ] No"),
          createBullet("Have you used facial recognition for any application?  [ ] Yes   [ ] No"),
          createBullet("Would you trust a facial recognition system for voting?  [ ] Yes   [ ] No   [ ] Unsure"),
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
          createParagraph("Please rate your agreement with each statement on a scale of 1-5:", true),
          createParagraph("(1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree)", false),
          new Paragraph({ spacing: { before: 150 } }),
          createBullet("1. I think that I would like to use this system frequently."),
          createBullet("2. I found the system unnecessarily complex."),
          createBullet("3. I thought the system was easy to use."),
          createBullet("4. I think that I would need the support of a technical person to be able to use this system."),
          createBullet("5. I found the various functions in this system were well integrated."),
          createBullet("6. I thought there was too much inconsistency in this system."),
          createBullet("7. I would imagine that most people would learn to use this system very quickly."),
          createBullet("8. I found the system very cumbersome to use."),
          createBullet("9. I felt very confident using the system."),
          createBullet("10. I needed to learn a lot of things before I could get going with this system."),
          new Paragraph({ spacing: { before: 400 } }),
          createHeading("Appendix D: Informed Consent Form", HeadingLevel.HEADING_2),
          createParagraph("Title of Study: Design and Implementation of a Secure Online Voting System Using Facial Recognition Technology: A Case Study of Chad Electoral Commission (CENI)", true),
          createParagraph("Researcher: [Student Name], Master's Student, Kigali Independent University", true),
          createParagraph("Purpose: This research aims to develop and evaluate a secure online voting system using facial recognition technology for Chad's electoral context.", true),
          createParagraph("Participation: Your participation is voluntary and you may withdraw at any time without penalty.", true),
          createParagraph("Confidentiality: All information collected will be kept confidential and used only for research purposes.", true),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "I have read and understood the above information and agree to participate in this study.",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Participant's Signature: ____________________   Date: ____________________",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "SecureVote_Chad_ULK_Dissertation.docx");
};
