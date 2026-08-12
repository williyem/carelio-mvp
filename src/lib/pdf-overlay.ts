import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PdfField {
  text: string;
  x: number;
  y: number;
  pageIndex: number; // 0-indexed
  fontSize?: number;
}

export interface UserData {
  // 1. Personal Information
  fullName: string;
  dob: string;
  date: string;
  phone: string;
  email: string;
  emergencyContact: string;
  primaryCarePhysician: string;
  emergencyContactPhone: string;

  address?: string;
  bloodType?: string;
  gender?: string;

  // 2. Telehealth Location Verification
  locationForToday: string;
  cityStateZip: string;
  locationType?: string;
  patientSignature?: string;

  // 3-6. Consents & Notices (Page 1)
  // 3-6. Consents & Notices (Page 1)
  patientInitials: string;

  // 7. ROI (Page 2)
  // 7. ROI (Page 2)
  // roiInitials removed, using patientInitials

  // 8. Financial Responsibility (Page 2)
  insuranceCompany: string;
  memberId: string;
  groupId: string;
  insurancePhone: string;
  insuranceCardName: string;
  insuranceAddress: string;

  // 9. Behavioral Health Consent (Page 2)
  // 9. Behavioral Health Consent (Page 2)
  // behavioralInitials removed, using patientInitials

  // 10. Minors (Page 3)
  parentGuardianName?: string;
  relationship?: string;

  // 11. Final Acknowledgment (Page 4)
  finalSignatureName: string;
  parentGuardianSignatureName?: string;
  printedName: string;
}

export const getPatientPacketMap = (userData: UserData): PdfField[] => {
  const fields: PdfField[] = [];

  // Group by sections for clarity

  // 1. Personal Information (Page 0)
  fields.push(
    { text: userData.fullName, x: 164, y: 500, pageIndex: 0, fontSize: 10 },
    { text: userData.dob, x: 164, y: 475, pageIndex: 0, fontSize: 10 },
    { text: userData.date, x: 294, y: 475, pageIndex: 0, fontSize: 10 },
    { text: userData.phone, x: 140, y: 450, pageIndex: 0, fontSize: 10 },
    { text: userData.email, x: 305, y: 450, pageIndex: 0, fontSize: 10 }, // Kept placeholder

    {
      text: userData.emergencyContact,
      x: 185,
      y: 426,
      pageIndex: 0,
      fontSize: 10,
    },
    {
      text: userData.emergencyContactPhone,
      x: 140,
      y: 400,
      pageIndex: 0,
      fontSize: 10,
    },
    {
      text: userData.primaryCarePhysician,
      x: 203,
      y: 377,
      pageIndex: 0,
      fontSize: 10,
    }
  );

  // 2. Telehealth Location Verification (Page 0)
  fields.push(
    {
      text: userData.locationForToday,
      x: 210,
      y: 221,
      pageIndex: 0,
      fontSize: 10,
    },
    { text: userData.cityStateZip, x: 193, y: 205, pageIndex: 0, fontSize: 10 },
    {
      text: userData.locationType || '',
      x: 350,
      y: 187,
      pageIndex: 0,
      fontSize: 10,
    },
    {
      text: userData.patientSignature || userData.fullName,
      x: 200,
      y: 163,
      pageIndex: 0,
      fontSize: 10,
    },
    { text: userData.date, x: 398, y: 162, pageIndex: 0, fontSize: 10 }
  );

  // 3-6 Page 1
  // general consent
  fields.push(
    {
      text: userData.patientInitials,
      x: 172,
      y: 683,
      pageIndex: 1,
      fontSize: 10,
    },
    { text: userData.date, x: 222, y: 683, pageIndex: 1, fontSize: 10 },
    // telehealth & remote device consent
    {
      text: userData.patientInitials,
      x: 172,
      y: 430,
      pageIndex: 1,
      fontSize: 10,
    },
    { text: userData.date, x: 250, y: 430, pageIndex: 1, fontSize: 10 },
    // security incident
    {
      text: userData.patientInitials,
      x: 172,
      y: 322,
      pageIndex: 1,
      fontSize: 10,
    },
    { text: userData.date, x: 250, y: 322, pageIndex: 1, fontSize: 10 }
  );
  // page 2
  fields.push(
    // notice of privacy practices
    {
      text: userData.patientInitials,
      x: 170,
      y: 614,
      pageIndex: 2,
      fontSize: 10,
    },
    { text: userData.date, x: 248, y: 614, pageIndex: 2, fontSize: 10 },
    {
      text: userData.patientInitials,
      x: 170,
      y: 482,
      pageIndex: 2,
      fontSize: 10,
    },
    { text: userData.date, x: 233, y: 482, pageIndex: 2, fontSize: 10 },
    //Authorization to charge & financial responsibility
    {
      text: userData.insuranceCompany,
      x: 200,
      y: 368,
      pageIndex: 2,
      fontSize: 10,
    },

    {
      text: userData.memberId,
      x: 180,
      y: 340,
      pageIndex: 2,
      fontSize: 10,
    },
    {
      text: userData.groupId,
      x: 346,
      y: 340,
      pageIndex: 2,
      fontSize: 10,
    },
    {
      text: userData.insurancePhone,
      x: 180,
      y: 312,
      pageIndex: 2,
      fontSize: 10,
    },
    {
      text: userData.insuranceCardName,
      x: 230,
      y: 284,
      pageIndex: 2,
      fontSize: 10,
    },
    {
      text: userData.insuranceAddress,
      x: 250,
      y: 257,
      pageIndex: 2,
      fontSize: 10,
    },
    // Behavioral Health Consent and Authorization
    {
      text: userData.patientInitials,
      x: 180,
      y: 61,
      pageIndex: 2,
      fontSize: 10,
    },
    { text: userData.date, x: 248, y: 61, pageIndex: 2, fontSize: 10 }
  );

  // page 3
  fields.push(
    // minors (if applicable)
    {
      text: userData.parentGuardianName || '',
      x: 196,
      y: 645,
      pageIndex: 3,
      fontSize: 10,
    },
    {
      text: userData.relationship || '',
      x: 167,
      y: 622,
      pageIndex: 3,
      fontSize: 10,
    },
    {
      text: userData.parentGuardianName ? userData.date : '',
      x: 348,
      y: 622,
      pageIndex: 3,
      fontSize: 10,
    },
    //final acknowledgement & signature
    {
      text: userData.finalSignatureName,
      x: 180,
      y: 513,
      pageIndex: 3,
      fontSize: 10,
    },
    { text: userData.date, x: 400, y: 513, pageIndex: 3, fontSize: 10 },
    {
      text: userData.printedName,
      x: 175,
      y: 490,
      pageIndex: 3,
      fontSize: 10,
    },
    {
      text: userData.parentGuardianSignatureName || '',
      x: 260,
      y: 456,
      pageIndex: 3,
      fontSize: 10,
    }
  );

  return fields;
};

export async function getPdfPageCount(templateUrl: string): Promise<number> {
  try {
    const existingPdfBytes = await fetch(templateUrl).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Error getting page count:', error);
    return 1; // Fallback
  }
}

export async function processPdfOverlay(
  templateUrl: string,
  fields: PdfField[]
) {
  try {
    const existingPdfBytes = await fetch(templateUrl).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    fields?.forEach(({ text, x, y, pageIndex, fontSize = 12 }) => {
      const page = pages[pageIndex];
      if (page) {
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error processing PDF overlay:', error);
    throw error;
  }
}
