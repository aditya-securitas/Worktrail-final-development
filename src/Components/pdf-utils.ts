import { type VerificationRecord } from './CandidateVerificationForm'
import { getDynamicBrandDomain } from './OrgLogo'
import securitasLogo from '../assets/Img/logo_b.png'

export interface LogoImageData {
  bytes: Uint8Array
  width: number
  height: number
}

let cachedLogoData: LogoImageData | null = null

export async function getLogoImageData(): Promise<LogoImageData | null> {
  if (cachedLogoData) return cachedLogoData

  try {
    const img = new Image()
    img.src = securitasLogo

    if (img.decode) {
      await img.decode().catch(() => {})
    }

    if (!img.complete || img.naturalWidth === 0) {
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
        setTimeout(resolve, 1500)
      })
    }

    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) return null

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // White background to cleanly blend against white PDF docket
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    const base64Data = dataUrl.split(',')[1]
    if (!base64Data) return null

    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    cachedLogoData = { bytes, width: w, height: h }
    return cachedLogoData
  } catch (err) {
    console.warn('Could not load logo image for PDF:', err)
    return null
  }
}

/**
 * Load and render client enterprise logo as a high-resolution PDF image asset.
 */
export async function loadExternalImageAsLogoData(url: string, orgName: string): Promise<LogoImageData | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url

    const timeout = setTimeout(() => {
      resolve(null)
    }, 1200)

    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 240
        canvas.height = 70
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)

        // White card background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, 240, 70)

        // Clean border
        ctx.strokeStyle = '#CBD5E1'
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, 238, 68)

        // Draw company icon/favicon
        ctx.drawImage(img, 12, 13, 44, 44)

        // Company Name
        ctx.fillStyle = '#0F172A'
        ctx.font = 'bold 13px Helvetica, Arial, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        const displayName = orgName.length > 18 ? orgName.slice(0, 16) + '...' : orgName
        ctx.fillText(displayName, 64, 32)

        // Subtitle tag
        ctx.fillStyle = '#059669'
        ctx.font = 'bold 9px Helvetica, Arial, sans-serif'
        ctx.fillText('VERIFIED ENTERPRISE', 64, 48)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        const base64Data = dataUrl.split(',')[1]
        if (!base64Data) return resolve(null)

        const binaryStr = atob(base64Data)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }
        resolve({ bytes, width: 240, height: 70 })
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(null)
    }
  })
}

/**
 * Generates an executive client badge for the PDF header.
 */
export function generateClientBadgeLogoData(orgName: string): LogoImageData {
  const canvas = document.createElement('canvas')
  canvas.width = 240
  canvas.height = 70
  const ctx = canvas.getContext('2d')!

  // White card background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, 240, 70)

  // Border
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 238, 68)

  // Brand avatar circle
  ctx.fillStyle = '#0680A6'
  ctx.beginPath()
  ctx.arc(34, 35, 22, 0, Math.PI * 2)
  ctx.fill()

  const initials = (orgName || 'Client')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CL'

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 16px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, 34, 35)

  // Text
  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 13px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const displayName = orgName.length > 18 ? orgName.slice(0, 16) + '...' : orgName
  ctx.fillText(displayName, 64, 32)

  ctx.fillStyle = '#059669'
  ctx.font = 'bold 9px Helvetica, Arial, sans-serif'
  ctx.fillText('VERIFIED ENTERPRISE', 64, 48)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  const base64Data = dataUrl.split(',')[1]
  const binaryStr = atob(base64Data)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return { bytes, width: 240, height: 70 }
}

const clientLogoCache: Record<string, LogoImageData> = {}

export async function getClientLogoData(orgName: string): Promise<LogoImageData | null> {
  const name = String(orgName || 'Enterprise Client').trim()
  if (clientLogoCache[name]) return clientLogoCache[name]

  const domain = getDynamicBrandDomain(name)
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const logoUrls: string[] = []

  if (domain) {
    logoUrls.push(
      `https://unavatar.io/${domain}`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://logo.clearbit.com/${domain}`
    )
  }
  if (clean && clean !== domain?.replace('.com', '')) {
    logoUrls.push(
      `https://unavatar.io/${clean}.com`,
      `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`,
      `https://logo.clearbit.com/${clean}.com`
    )
  }

  for (const url of logoUrls) {
    try {
      const data = await loadExternalImageAsLogoData(url, name)
      if (data) {
        clientLogoCache[name] = data
        return data
      }
    } catch {
      continue
    }
  }

  const badgeData = generateClientBadgeLogoData(name)
  clientLogoCache[name] = badgeData
  return badgeData
}

function pdfCircle(cx: number, cy: number, r: number): string {
  const c = r * 0.55228475
  return (
    `${cx.toFixed(2)} ${(cy + r).toFixed(2)} m\n` +
    `${(cx + c).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c\n` +
    `${(cx + r).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx + c).toFixed(2)} ${(cx - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c\n` +
    `${(cx - c).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c\n` +
    `f\n`
  )
}

function escapePdfText(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

export function buildPdf(
  streamContent: string,
  logoData?: LogoImageData | null,
  clientLogoData?: LogoImageData | null
): Uint8Array {
  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'

  const hasLeft = Boolean(logoData)
  const hasRight = Boolean(clientLogoData)

  let xobjectStr = ''
  if (hasLeft && hasRight) {
    xobjectStr = '/XObject << /Im1 7 0 R /Im2 8 0 R >> '
  } else if (hasLeft) {
    xobjectStr = '/XObject << /Im1 7 0 R >> '
  } else if (hasRight) {
    xobjectStr = '/XObject << /Im1 7 0 R /Im2 7 0 R >> '
  }

  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${xobjectStr}>> /Contents 6 0 R >>\nendobj\n`
  const obj4 =
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
  const obj5 =
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'

  const enc = new TextEncoder()
  const streamBytes = enc.encode(streamContent)
  const obj6Header = `6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`
  const obj6Footer = '\nendstream\nendobj\n'

  const headerBytes = enc.encode(header)
  const obj1Bytes = enc.encode(obj1)
  const obj2Bytes = enc.encode(obj2)
  const obj3Bytes = enc.encode(obj3)
  const obj4Bytes = enc.encode(obj4)
  const obj5Bytes = enc.encode(obj5)
  const obj6HBytes = enc.encode(obj6Header)
  const obj6FBytes = enc.encode(obj6Footer)

  const offset1 = headerBytes.length
  const offset2 = offset1 + obj1Bytes.length
  const offset3 = offset2 + obj2Bytes.length
  const offset4 = offset3 + obj3Bytes.length
  const offset5 = offset4 + obj4Bytes.length
  const offset6 = offset5 + obj5Bytes.length
  const offsetAfter6 = offset6 + obj6HBytes.length + streamBytes.length + obj6FBytes.length

  let obj7Bytes: Uint8Array | null = null
  let obj7HBytes: Uint8Array | null = null
  let obj7FBytes: Uint8Array | null = null
  let offset7 = 0
  let offsetAfter7 = offsetAfter6

  let obj8Bytes: Uint8Array | null = null
  let obj8HBytes: Uint8Array | null = null
  let obj8FBytes: Uint8Array | null = null
  let offset8 = 0
  let offsetAfter8 = offsetAfter6

  if (hasLeft && hasRight && logoData && clientLogoData) {
    offset7 = offsetAfter6
    const obj7Header = `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logoData.width} /Height ${logoData.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoData.bytes.length} >>\nstream\n`
    const obj7Footer = '\nendstream\nendobj\n'
    obj7HBytes = enc.encode(obj7Header)
    obj7Bytes = logoData.bytes
    obj7FBytes = enc.encode(obj7Footer)
    offsetAfter7 = offset7 + obj7HBytes.length + obj7Bytes.length + obj7FBytes.length

    offset8 = offsetAfter7
    const obj8Header = `8 0 obj\n<< /Type /XObject /Subtype /Image /Width ${clientLogoData.width} /Height ${clientLogoData.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${clientLogoData.bytes.length} >>\nstream\n`
    const obj8Footer = '\nendstream\nendobj\n'
    obj8HBytes = enc.encode(obj8Header)
    obj8Bytes = clientLogoData.bytes
    obj8FBytes = enc.encode(obj8Footer)
    offsetAfter8 = offset8 + obj8HBytes.length + obj8Bytes.length + obj8FBytes.length
  } else if (hasLeft && logoData) {
    offset7 = offsetAfter6
    const obj7Header = `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logoData.width} /Height ${logoData.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoData.bytes.length} >>\nstream\n`
    const obj7Footer = '\nendstream\nendobj\n'
    obj7HBytes = enc.encode(obj7Header)
    obj7Bytes = logoData.bytes
    obj7FBytes = enc.encode(obj7Footer)
    offsetAfter7 = offset7 + obj7HBytes.length + obj7Bytes.length + obj7FBytes.length
  } else if (hasRight && clientLogoData) {
    offset7 = offsetAfter6
    const obj7Header = `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${clientLogoData.width} /Height ${clientLogoData.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${clientLogoData.bytes.length} >>\nstream\n`
    const obj7Footer = '\nendstream\nendobj\n'
    obj7HBytes = enc.encode(obj7Header)
    obj7Bytes = clientLogoData.bytes
    obj7FBytes = enc.encode(obj7Footer)
    offsetAfter7 = offset7 + obj7HBytes.length + obj7Bytes.length + obj7FBytes.length
  }

  const pad = (n: number) => String(n).padStart(10, '0')
  let xref = ''
  let startxrefOffset = offsetAfter6
  let trailerSize = 7

  if (hasLeft && hasRight) {
    xref = `xref\n0 9\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n${pad(offset6)} 00000 n \n${pad(offset7)} 00000 n \n${pad(offset8)} 00000 n \n`
    startxrefOffset = offsetAfter8
    trailerSize = 9
  } else if (hasLeft || hasRight) {
    xref = `xref\n0 8\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n${pad(offset6)} 00000 n \n${pad(offset7)} 00000 n \n`
    startxrefOffset = offsetAfter7
    trailerSize = 8
  } else {
    xref = `xref\n0 7\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n${pad(offset6)} 00000 n \n`
    startxrefOffset = offsetAfter6
    trailerSize = 7
  }

  const trailer = `trailer\n<< /Size ${trailerSize} /Root 1 0 R >>\nstartxref\n${startxrefOffset}\n%%EOF\n`
  const xrefBytes = enc.encode(xref)
  const trailerBytes = enc.encode(trailer)

  const totalLength = startxrefOffset + xrefBytes.length + trailerBytes.length
  const result = new Uint8Array(totalLength)
  let pos = 0

  result.set(headerBytes, pos); pos += headerBytes.length
  result.set(obj1Bytes, pos); pos += obj1Bytes.length
  result.set(obj2Bytes, pos); pos += obj2Bytes.length
  result.set(obj3Bytes, pos); pos += obj3Bytes.length
  result.set(obj4Bytes, pos); pos += obj4Bytes.length
  result.set(obj5Bytes, pos); pos += obj5Bytes.length
  result.set(obj6HBytes, pos); pos += obj6HBytes.length
  result.set(streamBytes, pos); pos += streamBytes.length
  result.set(obj6FBytes, pos); pos += obj6FBytes.length

  if (obj7HBytes && obj7Bytes && obj7FBytes) {
    result.set(obj7HBytes, pos); pos += obj7HBytes.length
    result.set(obj7Bytes, pos); pos += obj7Bytes.length
    result.set(obj7FBytes, pos); pos += obj7FBytes.length
  }

  if (obj8HBytes && obj8Bytes && obj8FBytes) {
    result.set(obj8HBytes, pos); pos += obj8HBytes.length
    result.set(obj8Bytes, pos); pos += obj8Bytes.length
    result.set(obj8FBytes, pos); pos += obj8FBytes.length
  }

  result.set(xrefBytes, pos); pos += xrefBytes.length
  result.set(trailerBytes, pos); pos += trailerBytes.length

  return result
}

export function buildCandidatePdf(
  rec: VerificationRecord,
  logoData?: LogoImageData | null,
  clientLogoData?: LogoImageData | null
): Uint8Array {
  const candName = escapePdfText(rec.candidateName || 'Candidate')
  const empId = escapePdfText(rec.employeeId || 'N/A')
  const reqId = escapePdfText(rec.requestId || 'VR-REQ')
  const verifierName = escapePdfText(rec.verifierName || 'Registered Verifier')
  const designation = escapePdfText(rec.designation || 'N/A')
  const department = escapePdfText(rec.department || 'General')
  const doj = escapePdfText(rec.dateOfJoining || 'N/A')
  const dol = escapePdfText(rec.isCurrentlyEmployed ? 'Present' : rec.dateOfLeaving || 'N/A')
  const employedStatus = rec.isCurrentlyEmployed ? 'Currently Employed' : 'Relieved'
  const verificationType = escapePdfText(rec.verificationType || 'Standard Employment Verification')
  // Format submittedBy cleanly (handle email addresses)
  let rawSubmitted = rec.submittedBy || 'SecuritasClient'
  if (rawSubmitted.includes('@')) {
    const prefix = rawSubmitted.split('@')[0]
    rawSubmitted = prefix.length > 20 ? 'SecuritasClient' : prefix
  }
  const submittedBy = escapePdfText(rawSubmitted)
  const submittedAt = escapePdfText(rec.submittedAt || new Date().toISOString().split('T')[0])
  const contact = escapePdfText(rec.contactNumber || 'N/A')
  const candEmail = escapePdfText(rec.candidateEmail || 'N/A')
  const remarks = escapePdfText(
    rec.remarks && rec.remarks.trim()
      ? rec.remarks
      : 'Confirmed relieving date and integrity'
  )
  const status = rec.status || 'Pending'

  let s = ''

  // 1. Top Decorative Bar
  s += '0.012 0.122 0.188 rg 40 805 515 3 re f\n'

  // 2. Left Platform Branding (Securitas Logo Image or Vector Fallback)
  if (logoData) {
    const imgH = 34
    const imgW = Math.min(130, Math.round(imgH * (logoData.width / logoData.height)))
    s += `q\n${imgW} 0 0 ${imgH} 40 764 cm\n/Im1 Do\nQ\n`
    s += 'BT /F2 7.5 Tf 0.39 0.45 0.55 rg 40 752 Td (ENTERPRISE CANDIDATE VERIFICATION REPORT) Tj ET\n'
  } else {
    // 3 iconic red circles of Securitas
    s += '0.94 0.1 0.18 rg\n'
    s += pdfCircle(48, 788, 5.5)
    s += pdfCircle(63, 788, 5.5)
    s += pdfCircle(78, 788, 5.5)
    s += 'BT /F1 14 Tf 0.03 0.13 0.21 rg 40 768 Td (Securitas) Tj ET\n'
    s += 'BT /F2 7.5 Tf 0.39 0.45 0.55 rg 40 754 Td (ENTERPRISE CANDIDATE VERIFICATION REPORT) Tj ET\n'
  }

  // 3. Right Client/Contributor Logo Image
  if (clientLogoData) {
    const clH = 34
    const clW = Math.min(145, Math.round(clH * (clientLogoData.width / clientLogoData.height)))
    const clX = 555 - clW
    const imgRef = logoData ? '/Im2' : '/Im1'
    s += `q\n${clW} 0 0 ${clH} ${clX} 764 cm\n${imgRef} Do\nQ\n`
    s += `BT /F1 7.5 Tf 0.06 0.09 0.16 rg ${clX} 752 Td (TARGET ENTERPRISE CLIENT) Tj ET\n`
  }

  // 4. Candidate Profile Summary Box
  s += '0.96 0.97 0.98 rg 40 676 515 64 re f\n'
  s += '0.88 0.91 0.94 RG 1 w 40 676 515 64 re S\n'
  s += `BT /F1 14.5 Tf 0.06 0.09 0.16 rg 55 718 Td (${candName}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.39 0.45 0.55 rg 55 702 Td (Request ID: ${reqId}   |   Submitted: ${submittedAt}) Tj ET\n`

  // Dynamic spacing between Employee ID and Verifier so they never overlap
  const empIdText = `Employee ID: ${empId}`
  const verifierX = Math.min(235, 55 + Math.round(empIdText.length * 5.4) + 16)
  const verifierSummary = verifierName.length > 36 ? verifierName.slice(0, 34) + '...' : verifierName
  s += `BT /F1 8.5 Tf 0.02 0.5 0.65 rg 55 687 Td (${empIdText}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.35 0.4 0.5 rg ${verifierX} 687 Td (|   Verifier: ${verifierSummary}) Tj ET\n`

  // Status Badge placed neatly inside the summary box on the right
  const isVerified = status === 'Verified' || status === 'Approved'
  const isRejected = status === 'Rejected'

  if (isVerified) {
    s += '0.92 0.98 0.95 rg 402 690 142 36 re f\n'
    s += '0.06 0.73 0.51 RG 1.2 w 402 690 142 36 re S\n'
    s += 'BT /F2 7.5 Tf 0.2 0.55 0.4 rg 412 712 Td (VERIFICATION STATUS) Tj ET\n'
    s += 'BT /F1 10 Tf 0.04 0.6 0.4 rg 412 698 Td (VERIFIED CLEAN) Tj ET\n'
  } else if (isRejected) {
    s += '1.0 0.94 0.95 rg 402 690 142 36 re f\n'
    s += '0.88 0.15 0.28 RG 1.2 w 402 690 142 36 re S\n'
    s += 'BT /F2 7.5 Tf 0.6 0.25 0.3 rg 412 712 Td (VERIFICATION STATUS) Tj ET\n'
    s += 'BT /F1 10 Tf 0.85 0.12 0.25 rg 412 698 Td (REJECTED) Tj ET\n'
  } 

  // 5. Two Info Cards
  // Left Box
  s += '0.98 0.99 1.0 rg 40 568 250 94 re f\n'
  s += '0.88 0.91 0.94 RG 0.5 w 40 568 250 94 re S\n'
  s += 'BT /F1 10 Tf 0.012 0.122 0.188 rg 50 644 Td (EMPLOYMENT ATTRIBUTES) Tj ET\n'
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 628 Td (Designation: ${designation.length > 30 ? designation.slice(0, 28) + '...' : designation}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 613 Td (Department: ${department.length > 30 ? department.slice(0, 28) + '...' : department}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 598 Td (Joining Date: ${doj}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 583 Td (Leaving Date: ${dol}) Tj ET\n`

  // Right Box
  s += '0.98 0.99 1.0 rg 305 568 250 94 re f\n'
  s += '0.88 0.91 0.94 RG 0.5 w 305 568 250 94 re S\n'
  s += 'BT /F1 10 Tf 0.012 0.122 0.188 rg 315 644 Td (VERIFICATION AUDIT DETAILS) Tj ET\n'
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 628 Td (Verifier: ${verifierName.length > 30 ? verifierName.slice(0, 28) + '...' : verifierName}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 613 Td (Type: ${verificationType.length > 30 ? verificationType.slice(0, 28) + '...' : verificationType}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 598 Td (Submitted By: ${submittedBy.length > 30 ? submittedBy.slice(0, 28) + '...' : submittedBy}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 583 Td (Candidate Email: ${candEmail.length > 30 ? candEmail.slice(0, 28) + '...' : candEmail}) Tj ET\n`

  // 6. Table Section
  s += 'BT /F1 11 Tf 0.06 0.09 0.16 rg 40 544 Td (VERIFICATION BREAKDOWN AUDIT) Tj ET\n'

  // Table Header
  s += '0.93 0.95 0.98 rg 40 518 515 20 re f\n'
  s += '0.8 0.84 0.9 RG 0.5 w 40 518 515 20 re S\n'
  s += 'BT /F1 9 Tf 0.2 0.25 0.35 rg 50 524 Td (Parameter) Tj ET\n'
  s += 'BT /F1 9 Tf 0.2 0.25 0.35 rg 200 524 Td (Submitted / Record Value) Tj ET\n'
  s += 'BT /F1 9 Tf 0.2 0.25 0.35 rg 400 524 Td (Verification Result) Tj ET\n'

  // Verifier Organization formatting
  const lowerV = verifierName.toLowerCase()
  const verifierOrgDisplay =
    lowerV.includes('tcs') || lowerV.includes('tata consultancy')
      ? 'Tata Consultancy Services (TCS)'
      : rec.verifierCode && !verifierName.includes('(')
      ? `${verifierName} (${rec.verifierCode})`
      : verifierName

  const desigDeptValue =
    department && department !== 'General' && department !== '—'
      ? `${designation} (${department})`
      : designation

  const tableRows = [
    { param: 'Full Name', val: candName, res: isVerified ? 'Verified Match' : 'Recorded' },
    { param: 'Employee Code', val: empId, res: isVerified ? 'Matched Master DB' : 'Recorded' },
    { param: 'Verifier Organization', val: verifierOrgDisplay, res: 'Registered Enterprise' },
    { param: 'Designation & Dept', val: desigDeptValue, res: 'Verified Role' },
    { param: 'Tenure Period', val: `${doj} to ${dol}`, res: employedStatus },
    { param: 'Contact Number', val: contact, res: 'Phone Verified' },
    { param: 'Candidate Email', val: candEmail, res: 'Email Verified' },
    { param: 'Client Remarks', val: remarks, res: 'Audited' },
  ]

  let rowY = 496
  tableRows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      s += `0.98 0.98 0.99 rg 40 ${rowY - 4} 515 22 re f\n`
    }
    s += `0.9 0.92 0.95 RG 0.5 w 40 ${rowY - 4} 515 0.5 re S\n`
    s += `BT /F1 8.5 Tf 0.15 0.2 0.28 rg 50 ${rowY + 3} Td (${escapePdfText(r.param)}) Tj ET\n`
    const valText = r.val.length > 40 ? r.val.slice(0, 38) + '...' : r.val
    s += `BT /F2 8.5 Tf 0.15 0.2 0.28 rg 200 ${rowY + 3} Td (${escapePdfText(valText)}) Tj ET\n`
    s += `BT /F2 8.5 Tf 0.25 0.35 0.45 rg 400 ${rowY + 3} Td (${escapePdfText(r.res)}) Tj ET\n`
    rowY -= 22
  })

  // 7. Security Seal & Footer
  s += '0.85 0.88 0.92 RG 1 w 40 85 515 0.5 re S\n'
  s += 'BT /F1 8 Tf 0.02 0.5 0.65 rg 40 70 Td (SECURITAS COMPLIANCE ENGINE) Tj ET\n'
  s += `BT /F2 8 Tf 0.45 0.5 0.6 rg 40 56 Td (Document Token: ${reqId}-${Date.now().toString().slice(-6)}   |   Generated: ${new Date().toLocaleDateString('en-GB')}) Tj ET\n`
  s += 'BT /F1 8 Tf 0.06 0.73 0.51 rg 395 62 Td (CERTIFIED VERIFICATION DOCKET) Tj ET\n'

  return buildPdf(s, logoData, clientLogoData)
}
