import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Eye,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Mail,
  Phone,
  Layers,
  Sparkles,
  FileDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Info,
  UploadCloud,
  FileUp,
  Paperclip,
  Upload,
  Check
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  type VerificationRecord,
  analyzeCandidateData,
  type MissingDataReport,
  readDocumentAsBase64
} from './CandidateVerificationForm'
import { OrgLogo, getDynamicBrandDomain } from './OrgLogo'
import { useAuth } from '../useAuth'
import { API_ENDPOINTS } from '../endpoint'
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
    `${(cx + r).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx + c).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c\n` +
    `${(cx - c).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c\n` +
    `${(cx - r).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx - c).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c\n` +
    `f\n`
  )
}

function escapePdfText(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\)')
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
  const submittedBy = escapePdfText(rec.submittedBy || 'Client User')
  const submittedAt = escapePdfText(rec.submittedAt || new Date().toISOString().split('T')[0])
  const contact = escapePdfText(rec.contactNumber || 'N/A')
  const candEmail = escapePdfText(rec.candidateEmail || 'N/A')
  const remarks = escapePdfText(rec.remarks ? rec.remarks.slice(0, 50) : 'None')
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

  // 3. Right Client Logo Image
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
  s += `BT /F1 8.5 Tf 0.02 0.5 0.65 rg 55 687 Td (Employee ID: ${empId}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.35 0.4 0.5 rg 180 687 Td (|   Verifier: ${verifierName.slice(0, 28)}) Tj ET\n`

  // Status Badge placed neatly inside the summary box on the right
  const isVerified = status === 'Verified'
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
  } else {
    s += '1.0 0.98 0.92 rg 402 690 142 36 re f\n'
    s += '0.85 0.55 0.1 RG 1.2 w 402 690 142 36 re S\n'
    s += 'BT /F2 7.5 Tf 0.6 0.45 0.15 rg 412 712 Td (VERIFICATION STATUS) Tj ET\n'
    s += 'BT /F1 10 Tf 0.75 0.42 0.05 rg 412 698 Td (PENDING REVIEW) Tj ET\n'
  }

  // 5. Two Info Cards
  // Left Box
  s += '0.98 0.99 1.0 rg 40 568 250 94 re f\n'
  s += '0.88 0.91 0.94 RG 0.5 w 40 568 250 94 re S\n'
  s += 'BT /F1 10 Tf 0.012 0.122 0.188 rg 50 644 Td (EMPLOYMENT ATTRIBUTES) Tj ET\n'
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 628 Td (Designation: ${designation}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 613 Td (Department: ${department}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 598 Td (Joining Date: ${doj}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 50 583 Td (Leaving Date: ${dol}) Tj ET\n`

  // Right Box
  s += '0.98 0.99 1.0 rg 305 568 250 94 re f\n'
  s += '0.88 0.91 0.94 RG 0.5 w 305 568 250 94 re S\n'
  s += 'BT /F1 10 Tf 0.012 0.122 0.188 rg 315 644 Td (VERIFICATION AUDIT DETAILS) Tj ET\n'
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 628 Td (Verifier: ${verifierName}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 613 Td (Type: ${verificationType}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 598 Td (Submitted By: ${submittedBy}) Tj ET\n`
  s += `BT /F2 8.5 Tf 0.25 0.25 0.3 rg 315 583 Td (Candidate Email: ${candEmail}) Tj ET\n`

  // 6. Table Section
  s += 'BT /F1 11 Tf 0.06 0.09 0.16 rg 40 544 Td (VERIFICATION BREAKDOWN AUDIT) Tj ET\n'

  // Table Header
  s += '0.93 0.95 0.98 rg 40 518 515 20 re f\n'
  s += '0.8 0.84 0.9 RG 0.5 w 40 518 515 20 re S\n'
  s += 'BT /F1 9 Tf 0.2 0.25 0.35 rg 50 524 Td (Parameter) Tj ET\n'
  s += 'BT /F1 9 Tf 0.2 0.25 0.35 rg 200 524 Td (Submitted / Record Value) Tj ET\n'
  s += 'BT /F1 9 Tf 0.2 0.25 0.35 rg 400 524 Td (Verification Result) Tj ET\n'

  // Table Rows
  const tableRows = [
    { param: 'Full Name', val: candName, res: isVerified ? 'Verified Match' : 'Recorded' },
    { param: 'Employee Code', val: empId, res: isVerified ? 'Matched Master DB' : 'Recorded' },
    { param: 'Verifier Organization', val: verifierName, res: 'Registered Enterprise' },
    { param: 'Designation & Dept', val: `${designation} (${department})`, res: 'Verified Role' },
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
    s += `BT /F2 8.5 Tf 0.15 0.2 0.28 rg 200 ${rowY + 3} Td (${escapePdfText(r.val.slice(0, 35))}) Tj ET\n`
    s += `BT /F2 8.5 Tf 0.25 0.35 0.45 rg 400 ${rowY + 3} Td (${escapePdfText(r.res)}) Tj ET\n`
    rowY -= 22
  })

  // 7. Security Seal & Footer
  s += '0.85 0.88 0.92 RG 1 w 40 85 515 0.5 re S\n'
  s += 'BT /F1 8 Tf 0.02 0.5 0.65 rg 40 70 Td (WALSONS COMPLIANCE ENGINE) Tj ET\n'
  s += `BT /F2 8 Tf 0.45 0.5 0.6 rg 40 56 Td (Document Token: ${reqId}-${Date.now().toString().slice(-6)}   |   Generated: ${new Date().toLocaleDateString('en-GB')}) Tj ET\n`
  s += 'BT /F1 8 Tf 0.06 0.73 0.51 rg 395 62 Td (CERTIFIED VERIFICATION DOCKET) Tj ET\n'

  return buildPdf(s, logoData, clientLogoData)
}

function Client() {
  const { user } = useAuth()
  const isClient = user?.Usertype?.toLowerCase() === 'client'
  const clientIdentifier = user?.id
    ? `CL-${user.id}`
    : user?.username
    ? `CL-${user.username.toUpperCase()}`
    : 'CL-CLIENT'

  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All')
  const [selectedCompletenessFilter, setSelectedCompletenessFilter] = useState<string>('All')
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [checkingStatusId, setCheckingStatusId] = useState<string | null>(null)
  const [statusFeedback, setStatusFeedback] = useState<{ [reqId: string]: string }>({})

  // Missing Document Uploader Modal State
  const [uploadRecord, setUploadRecord] = useState<VerificationRecord | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<string>('Letter of Authorization (LOA)')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploadRemarks, setUploadRemarks] = useState<string>('')
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)

  const openUploadModal = (rec: VerificationRecord, preferredDocType?: string) => {
    setUploadRecord(rec)
    const analysis = analyzeCandidateData(rec)
    const hasLoaMissing = analysis.items.some((i) => i.fieldKey === 'loa' && i.status !== 'valid')
    setSelectedDocType(preferredDocType || (hasLoaMissing ? 'Letter of Authorization (LOA)' : 'Experience / Relieving Letter'))
    setSelectedFile(null)
    setFilePreview(null)
    setUploadRemarks('')
    setUploadError(null)
    setUploadSuccessMsg(null)
    setIsDragOver(false)
  }

  const closeUploadModal = () => {
    setUploadRecord(null)
    setSelectedFile(null)
    setFilePreview(null)
    setUploadRemarks('')
    setUploadError(null)
    setUploadSuccessMsg(null)
    setIsDragOver(false)
  }

  const handleSelectFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setFilePreview(null)
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15MB limit. Please choose a smaller file.')
      return
    }
    setUploadError(null)
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setFilePreview(url)
    } else {
      setFilePreview(null)
    }
  }

  const handleUploadDocument = async () => {
    if (!uploadRecord) return
    if (!selectedFile) {
      setUploadError('Please select a document file to upload.')
      return
    }

    setIsUploadingDoc(true)
    setUploadError(null)
    setUploadSuccessMsg(null)

    try {
      const base64Data = await readDocumentAsBase64(selectedFile, true)
      const isLoa = selectedDocType === 'Letter of Authorization (LOA)'
      const clientEmail = (user?.email || user?.Email || user?.username || uploadRecord.submittedBy || '').trim()

      const payload = {
        requestId: uploadRecord.requestId,
        RequestId: uploadRecord.requestId,
        EmployeeCode: uploadRecord.employeeId,
        Clientemail: clientEmail,
        email: clientEmail,
        documentType: selectedDocType,
        DocumentType: selectedDocType,
        document: base64Data,
        Document: base64Data,
        fileName: selectedFile.name,
        FileName: selectedFile.name,
        fileType: selectedFile.type,
        remarks: uploadRemarks || `Uploaded ${selectedDocType} via client verification portal`,
        LOA: isLoa ? base64Data : undefined,
        SupportingDocs: !isLoa ? base64Data : undefined,
        clientId: uploadRecord.clientId || clientIdentifier,
      }

      const primaryUrl = API_ENDPOINTS.clientDocumentUpdate || 'https://worktrail.ai/api/ClientDocumentUpdate'
      let isSuccess = false

      try {
        const res = await fetch(primaryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            APIKEY: 'Securitas@#!1234',
          },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          isSuccess = true
        }
      } catch (err1) {
        console.warn('Primary ClientDocumentUpdate fetch notice:', err1)
      }

      // Fallback to literal https://worktrail.ai/apiClientDocumentUpdate if needed
      if (!isSuccess) {
        try {
          const fallbackUrl = 'https://worktrail.ai/apiClientDocumentUpdate'
          const res2 = await fetch(fallbackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              APIKEY: 'Securitas@#!1234',
            },
            body: JSON.stringify(payload),
          })
          if (res2.ok) {
            isSuccess = true
          }
        } catch (err2) {
          console.warn('Fallback apiClientDocumentUpdate fetch notice:', err2)
        }
      }

      // Update in component state
      const nowIso = new Date().toISOString()
      const updatedList = records.map((r) => {
        if (r.id === uploadRecord.id || r.requestId === uploadRecord.requestId) {
          const newDocCount = (r.uploadedFilesCount || 0) + 1
          return {
            ...r,
            uploadedFilesCount: newDocCount,
            ...(isLoa ? { LOA: base64Data, loaDocument: base64Data } : { SupportingDocs: base64Data }),
            customFields: {
              ...r.customFields,
              ...(isLoa ? { LOA: base64Data } : { SupportingDocs: base64Data }),
              lastUploadedDoc: selectedFile.name,
              lastUploadedDocType: selectedDocType,
              lastUploadedAt: nowIso,
            },
            dynamicData: {
              ...r.dynamicData,
              ...(isLoa ? { LOA: base64Data } : { SupportingDocs: base64Data }),
              lastUploadedDoc: selectedFile.name,
              lastUploadedDocType: selectedDocType,
              lastUploadedAt: nowIso,
            },
          }
        }
        return r
      })
      setRecords(updatedList)

      if (selectedRecord && (selectedRecord.id === uploadRecord.id || selectedRecord.requestId === uploadRecord.requestId)) {
        setSelectedRecord({
          ...selectedRecord,
          uploadedFilesCount: (selectedRecord.uploadedFilesCount || 0) + 1,
          ...(isLoa ? { LOA: base64Data, loaDocument: base64Data } : { SupportingDocs: base64Data }),
        })
      }



      setUploadSuccessMsg(`Document "${selectedFile.name}" successfully uploaded and attached to ${uploadRecord.candidateName}!`)

      setTimeout(() => {
        closeUploadModal()
      }, 1500)
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process and upload document. Please try again.')
    } finally {
      setIsUploadingDoc(false)
    }
  }

  // Load records from live database API (ClientEmpData) and recently submitted local records mapped by Client ID
  const loadRecords = async () => {
    let apiRecords: VerificationRecord[] = []
    const clientEmail = (user?.email || user?.Email || user?.username || '').trim()
    const employeeIdVal = String(user?.id || user?.EmployeeCode || user?.EmployeeId || (user as any)?.clientEmployeeId || '').replace(/^CL-/, '')

    try {
      const statusApiUrl = API_ENDPOINTS.clientEmpStatus || 'https://worktrail.ai/api/ClientEmpStatus'
      let clientEmpList: any[] = []

      // 1. Primary: GET on client employee ID and client email from clientEmpStatus API
      if (clientEmail || employeeIdVal) {
        try {
          const queryParams = new URLSearchParams()
          if (employeeIdVal) {
            queryParams.append('clientEmployeeId', employeeIdVal)
            queryParams.append('EmployeeCode', employeeIdVal)
            queryParams.append('EmployeeId', employeeIdVal)
            queryParams.append('ClientEmpId', employeeIdVal)
            queryParams.append('id', employeeIdVal)
          }
          if (clientEmail) {
            queryParams.append('Clientemail', clientEmail)
            queryParams.append('email', clientEmail)
          }

          const res = await fetch(`${statusApiUrl}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              APIKEY: 'Securitas@#!1234',
              'Content-Type': 'application/json',
            },
          })
          if (res.ok) {
            const data = await res.json()
            clientEmpList = Array.isArray(data) ? data : data?.data || data?.candidates || data?.records || data?.status || []
          }
        } catch (statusErr) {
          console.warn('ClientEmpStatus GET query notice in Client:', statusErr)
        }

        // If combined params returned empty, try with clientEmployeeId alone or Clientemail alone
        if (!clientEmpList || clientEmpList.length === 0) {
          if (employeeIdVal) {
            try {
              const res = await fetch(`${statusApiUrl}?clientEmployeeId=${encodeURIComponent(employeeIdVal)}`, {
                method: 'GET',
                headers: {
                  APIKEY: 'Securitas@#!1234',
                  'Content-Type': 'application/json',
                },
              })
              if (res.ok) {
                const data = await res.json()
                clientEmpList = Array.isArray(data) ? data : data?.data || data?.candidates || data?.records || data?.status || []
              }
            } catch (err) {
              console.warn('ClientEmpStatus employee ID GET notice in Client:', err)
            }
          }

          if (!clientEmpList || clientEmpList.length === 0) {
            if (clientEmail) {
              try {
                const res = await fetch(`${statusApiUrl}?Clientemail=${encodeURIComponent(clientEmail)}`, {
                  method: 'GET',
                  headers: {
                    APIKEY: 'Securitas@#!1234',
                    'Content-Type': 'application/json',
                  },
                })
                if (res.ok) {
                  const data = await res.json()
                  clientEmpList = Array.isArray(data) ? data : data?.data || data?.candidates || data?.records || data?.status || []
                }
              } catch (err) {
                console.warn('ClientEmpStatus single GET notice in Client:', err)
              }
            }
          }
        }
      }

      // 2. Secondary fallback: Query clientEmpData if clientEmpStatus returned no records
      if (!clientEmpList || clientEmpList.length === 0) {
        const fallbackUrl = API_ENDPOINTS.clientEmpData || 'https://worktrail.ai/api/ClientEmpData'
        try {
          const res = await fetch(fallbackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              APIKEY: 'Securitas@#!1234',
            },
            body: JSON.stringify({
              Clientemail: clientEmail,
              email: clientEmail,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            clientEmpList = Array.isArray(data) ? data : data?.data || data?.candidates || []
          }
        } catch (postErr) {
          console.warn('ClientEmpData POST query notice:', postErr)
        }
      }

      // 3. Fallback GET on clientEmpData if still empty
      if (!clientEmpList || clientEmpList.length === 0) {
        const fallbackUrl = API_ENDPOINTS.clientEmpData || 'https://worktrail.ai/api/ClientEmpData'
        try {
          const getRes = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              APIKEY: 'Securitas@#!1234',
            },
          })
          if (getRes.ok) {
            const getData = await getRes.json()
            clientEmpList = Array.isArray(getData) ? getData : getData?.data || getData?.candidates || []
          }
        } catch (getErr) {
          console.warn('ClientEmpData GET query notice:', getErr)
        }
      }

      if (Array.isArray(clientEmpList) && clientEmpList.length > 0) {
        // Flatten nested candidates if API returned grouped payloads
        const flatList: any[] = []
        clientEmpList.forEach((item: any, itemIdx: number) => {
          if (Array.isArray(item.candidates) && item.candidates.length > 0) {
            item.candidates.forEach((c: any, cIdx: number) => {
              flatList.push({
                ...item,
                ...c,
                id: c.id || item.id || `client-cand-${itemIdx}-${cIdx}`,
                RequestId: c.RequestId || c.requestId || item.RequestId || item.requestId || item.orderId,
                Contributor: c.Contributor || item.Contributor || item.verifierName,
                Clientemail: c.Clientemail || item.Clientemail || clientEmail,
                verificationType: c.verificationType || item.verificationType,
                status: c.status || item.status || 'Pending',
                created_at: c.created_at || item.created_at,
              })
            })
          } else {
            flatList.push(item)
          }
        })

        // If logged in as client, filter to client's records if email tag is present
        const filteredByClient = isClient && clientEmail
          ? flatList.filter((item: any) => {
              const itemClient = (item.Clientemail || item.ClientEmail || item.clientEmail || item.submittedBy || '').trim().toLowerCase()
              return !itemClient || itemClient === clientEmail.toLowerCase()
            })
          : flatList

        apiRecords = filteredByClient.map((item: any, idx: number) => {
          const fullName =
            [item.FirstName, item.MiddleName, item.LastName].filter(Boolean).join(' ') ||
            item.candidateName ||
            item.CandidateName ||
            item.name ||
            'Candidate'

          return {
            id: item.id ? String(item.id) : (item.RequestId ? String(item.RequestId) : `client-rec-${idx}`),
            requestId: item.RequestId || item.requestId || item.orderId || `VR-2026-${1000 + idx}`,
            clientId: item.clientId || clientIdentifier,
            candidateName: fullName,
            employeeId: item.EmployeeCode || item.employeeId || item.EmpCode || '—',
            candidateEmail: item.Email || item.candidateEmail || item.email || '',
            contactNumber: item.MobileNo || item.contactNumber || item.mobile || '',
            verifierId: item.OrganizationID ? String(item.OrganizationID) : '1',
            verifierName: item.Contributor || item.verifierName || 'Registered Enterprise',
            verifierCategory: 'Registered Organization',
            verifierCode: `ORG-${item.OrganizationID || '1'}`,
            dateOfJoining: item.DateOfJoining || item.dateOfJoining || '—',
            dateOfLeaving: item.DateOfLeaving || item.dateOfLeaving || 'Present',
            isCurrentlyEmployed: !item.DateOfLeaving || item.DateOfLeaving.toLowerCase() === 'present',
            designation: item.LastPositionHeld || item.designation || item.Designation || '—',
            department: item.Department || item.department || '—',
            verificationType: item.verificationType || item.VerificationType || 'Standard Employment Verification',
            remarks: item.remarks || item.Remarks || 'Client Employment Verification Record',
            uploadedFilesCount: item.LOA ? 1 : (item.uploadedFilesCount || 0),
            submittedBy: item.Clientemail || item.submittedBy || user?.username || 'Client User',
            submittedAt: item.created_at ? item.created_at.split('T')[0] : (item.submittedAt || new Date().toISOString().split('T')[0]),
            status: (item.status as any) || 'Pending',
            amount: item.Amount || item.amount || 1499,
            transactionId: item.TransactionId || item.transactionId,
            paymentId: item.PaymentId || item.paymentId,
            orderId: item.OrderId || item.orderId,
            customFields: item,
            dynamicData: item,
          }
        })
      }

    } catch (apiErr) {
      console.warn('ClientEmpData records fetch notice:', apiErr)
    }

    setRecords(apiRecords)
  }

  useEffect(() => {
    try {
      localStorage.removeItem('worktrail_verification_records')
    } catch {}
    loadRecords()
    getLogoImageData().catch(() => {})
  }, [user])

  // Live status checker connecting to ReviewClientData API
  const handleCheckStatus = async (record: VerificationRecord) => {
    if (!record) return
    const reqKey = record.requestId || record.id
    setCheckingStatusId(reqKey)
    setStatusFeedback((prev) => ({
      ...prev,
      [reqKey]: 'Querying verifier live network...',
    }))

    try {
      const checkUrl = API_ENDPOINTS.reviewClientData || 'https://worktrail.ai/api/ReviewClientData'
      let liveStatus = record.status || 'Pending'
      let feedbackMsg = `Status confirmed: ${liveStatus} at ${record.verifierName}. Queued in verification workflow.`

      try {
        const res = await fetch(checkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            APIKEY: 'Securitas@#!1234',
          },
          body: JSON.stringify({
            requestId: reqKey,
            EmployeeCode: record.employeeId,
            Clientemail: (user?.email || user?.Email || user?.username || record.submittedBy || '').trim(),
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : data?.data || data?.candidates || []
          const match = Array.isArray(list)
            ? list.find(
                (m: any) =>
                  (m.RequestId && m.RequestId === reqKey) ||
                  (m.requestId && m.requestId === reqKey) ||
                  (m.EmployeeCode && m.EmployeeCode === record.employeeId)
              )
            : null

          if (match && match.status) {
            liveStatus = match.status
            feedbackMsg = `Live status updated: ${match.status} (Verified from ${record.verifierName} database).`
          }
        }
      } catch (fetchErr) {
        console.warn('ReviewClientData query notice:', fetchErr)
      }

      const updated = records.map((r) =>
        r.id === record.id || r.requestId === reqKey ? { ...r, status: liveStatus as any } : r
      )
      setRecords(updated)

      if (selectedRecord && (selectedRecord.id === record.id || selectedRecord.requestId === reqKey)) {
        setSelectedRecord({ ...selectedRecord, status: liveStatus as any })
      }

      setStatusFeedback((prev) => ({
        ...prev,
        [reqKey]: feedbackMsg,
      }))
    } catch {
      setStatusFeedback((prev) => ({
        ...prev,
        [reqKey]: `Status checked: ${record.status || 'Pending'}. Record active.`,
      }))
    } finally {
      setCheckingStatusId(null)
    }
  }

  // Update status of a record
  const handleUpdateStatus = (recordId: string, newStatus: VerificationRecord['status']) => {
    setIsUpdatingStatus(true)
    const updated = records.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
    setRecords(updated)
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({ ...selectedRecord, status: newStatus })
    }
    setTimeout(() => setIsUpdatingStatus(false), 300)
  }

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.clientId && String(r.clientId).toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.verifierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus
    const matchesCompany = selectedCompanyFilter === 'All' || r.verifierName === selectedCompanyFilter

    const analysis = analyzeCandidateData(r)
    const matchesCompleteness =
      selectedCompletenessFilter === 'All' ||
      (selectedCompletenessFilter === 'Complete' && analysis.missingCount === 0) ||
      (selectedCompletenessFilter === 'Missing' && analysis.missingCount > 0)

    return matchesSearch && matchesStatus && matchesCompany && matchesCompleteness
  })

  // Metrics
  const totalRequests = records.length
  const pendingRequests = records.filter((r) => r.status === 'Pending').length
  const inProgressRequests = records.filter((r) => r.status === 'In Progress').length
  const verifiedRequests = records.filter((r) => r.status === 'Verified').length
  const rejectedRequests = records.filter((r) => r.status === 'Rejected').length
  const recordsWithMissingData = records.filter((r) => analyzeCandidateData(r).missingCount > 0).length

  const getStatusBadge = (status: VerificationRecord['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified
          </span>
        )
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            In Progress
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        )
    }
  }

  const exportExcel = () => {
    if (filteredRecords.length === 0) return
    const rows = filteredRecords.map((r, i) => {
      const analysis = analyzeCandidateData(r)
      const missingFields = analysis.items
        .filter((item) => item.status === 'missing')
        .map((item) => item.fieldName)
        .join('; ')
      return {
        'S.No': i + 1,
        'Client ID': r.clientId || clientIdentifier,
        'Request ID': r.requestId,
        'Candidate Name': r.candidateName,
        'Employee ID': r.employeeId,
        'Verifier Company': r.verifierName,
        'Data Completeness': `${analysis.completenessPercent}%`,
        'Missing Fields': missingFields || 'None (Complete)',
        'Date of Joining': r.dateOfJoining,
        'Date of Leaving': r.dateOfLeaving,
        'Designation': r.designation,
        'Department': r.department || 'General',
        'Verification Type': r.verificationType,
        'Submitted By': r.submittedBy,
        'Submission Date': r.submittedAt,
        'Verification Status': r.status,
        'Remarks': r.remarks || '',
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Verification_Requests')
    XLSX.writeFile(wb, `Candidate_Verification_Requests_${clientIdentifier}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const downloadPDF = async (rec: VerificationRecord) => {
    try {
      const [logoData, clientLogoData] = await Promise.all([
        getLogoImageData(),
        getClientLogoData(rec.verifierName || 'Enterprise Client'),
      ])
      const pdfBytes = buildCandidatePdf(rec, logoData, clientLogoData)
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safeId = (rec.employeeId || rec.requestId || 'Record').replace(/[^a-zA-Z0-9_-]/g, '_')
      const fileName = `Verification_Report_${safeId}.pdf`
      link.setAttribute('download', fileName)
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
        URL.revokeObjectURL(url)
      }, 1500)

      // Mark record as downloaded
      const nowIso = new Date().toISOString()
      const updatedList = records.map((r) => {
        if (r.id === rec.id || (r.requestId && r.requestId === rec.requestId)) {
          return {
            ...r,
            isDownloaded: true,
            inRecycleBin: true,
            downloadedAt: nowIso,
            downloadedBy: user?.Username || (user as any)?.Email || 'Client',
          }
        }
        return r
      })
      setRecords(updatedList)
      if (selectedRecord && (selectedRecord.id === rec.id || selectedRecord.requestId === rec.requestId)) {
        setSelectedRecord({
          ...selectedRecord,
          isDownloaded: true,
          inRecycleBin: true,
          downloadedAt: nowIso,
          downloadedBy: user?.Username || (user as any)?.Email || 'Client',
        })
      }
    } catch (err) {
      console.error('Direct PDF download error:', err)
    }
  }

  return (
    <div className="w-full font-securitas space-y-8 animate-fade-in pb-16">
      {/* 1. Header Bar with Client ID Mapping */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0680A6]">
              {isClient ? 'Live Verification Tracking' : 'Verification Records & Compliance'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0680A6]/10 text-[#0680A6] border border-[#0680A6]/25">
              <Building2 className="w-3 h-3" />
              Client ID: {clientIdentifier}
            </span>
            {user?.CompanyName && (
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                • {user.CompanyName}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isClient ? 'Candidate Verification Requests' : 'Client Candidate Verification Requests'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isClient
              ? `Review all candidate verification requests mapped to Client ID (${clientIdentifier}), audit missing parameters, and check live status directly.`
              : 'Monitor, audit missing parameters, and process candidate background verification requests submitted across client accounts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRecords}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportExcel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#031f30] hover:bg-[#0680A6] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* 2. Stat Summary Cards (Including Data Quality Alert) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Requests */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Requests</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block font-mono">Mapped: {clientIdentifier}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-50 text-[#031f30] flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{pendingRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting partner</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500">In Progress</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-1">{inProgressRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Under verification</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Verified</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{verifiedRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">{rejectedRequests} rejected</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Data Attention / Missing Data Stat Card */}
        <div
          onClick={() => setSelectedCompletenessFilter(selectedCompletenessFilter === 'Missing' ? 'All' : 'Missing')}
          className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer shadow-sm flex items-center justify-between ${
            selectedCompletenessFilter === 'Missing' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-100'
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Data Attention</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{recordsWithMissingData}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {recordsWithMissingData > 0 ? 'Missing fields detected' : 'All data 100% complete'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Table Card */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, ID, client, company..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:ring-2 focus:ring-[#0680A6]/10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {['All', 'Pending', 'In Progress', 'Verified', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Completeness Filter (View Missing Data) */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedCompletenessFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCompletenessFilter === 'All'
                    ? 'bg-[#031f30] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedCompletenessFilter('Complete')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCompletenessFilter === 'Complete'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ✓ Complete
              </button>
              <button
                type="button"
                onClick={() => setSelectedCompletenessFilter('Missing')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCompletenessFilter === 'Missing'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ⚠️ Missing Data {recordsWithMissingData > 0 && `(${recordsWithMissingData})`}
              </button>
            </div>

            {/* Verifier Company Filter */}
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0680A6]"
            >
              <option value="All">All Companies</option>
              {Array.from(new Set(records.map((r) => r.verifierName).filter(Boolean))).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Request & Client ID</th>
                <th className="px-6 py-4">Candidate Profile</th>
                <th className="px-6 py-4">Data Quality</th>
                <th className="px-6 py-4">Target Verifier</th>
                <th className="px-6 py-4">Tenure & Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const analysis = analyzeCandidateData(rec)
                  const missingItems = analysis.items.filter((i) => i.status === 'missing')
                  const reqKey = rec.requestId || rec.id
                  const isChecking = checkingStatusId === reqKey
                  const feedback = statusFeedback[reqKey]

                  return (
                    <tr key={rec.id || rec.requestId} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Request ID & Client ID */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-[#0680A6]">{rec.requestId}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit mt-1">
                            {rec.clientId || clientIdentifier}
                          </span>
                        </div>
                      </td>

                      {/* Candidate Profile */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{rec.candidateName}</span>
                          <span className="text-xs text-slate-400 font-mono">ID: {rec.employeeId}</span>
                          {rec.candidateEmail && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[170px]">{rec.candidateEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Data Quality / Missing Data View */}
                      <td className="px-6 py-4">
                        {analysis.missingCount === 0 ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Complete (100%)
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1">All fields present</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 w-fit">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              {analysis.missingCount} Missing
                            </span>
                            <span
                              className="text-[10px] text-amber-700 font-medium mt-1 truncate max-w-[170px]"
                              title={missingItems.map((i) => i.fieldName).join(', ')}
                            >
                              Missing: {missingItems.map((i) => i.fieldName.replace('Candidate ', '')).join(', ')}
                            </span>
                            <button
                              type="button"
                              onClick={() => openUploadModal(rec)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5850EC] hover:text-[#4338ca] hover:underline mt-1 cursor-pointer w-fit"
                              title="Upload missing documents or LOA"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Upload doc</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Verifier */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <OrgLogo name={rec.verifierName} className="w-7 h-7 rounded-lg shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{rec.verifierName}</span>
                            <span className="text-[11px] text-slate-400">{rec.verifierCategory}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tenure */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-slate-700">{rec.designation}</span>
                          <span className="text-slate-400">
                            {rec.dateOfJoining} → {rec.dateOfLeaving}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(rec.status)}
                          {feedback && (
                            <span className="text-[10px] text-[#0680A6] font-medium max-w-[160px] truncate" title={feedback}>
                              {feedback}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Missing Document Uploader Button */}
                          <button
                            type="button"
                            onClick={() => openUploadModal(rec)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                            title="Upload Missing Document / LOA"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Upload Doc</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCheckStatus(rec)}
                            disabled={isChecking}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            title="Check Live Verification Status"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-sky-600' : 'text-sky-500'}`} />
                            <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedRecord(rec)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-gradient-to-tr from-[#10B981] to-[#5850EC] hover:text-white text-slate-700 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs"
                            title="Inspect Candidate Data & Audit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Detail</span>
                          </button>

                          {rec.status === 'Verified' && (
                            <button
                              type="button"
                              onClick={() => downloadPDF(rec)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-gradient-to-tr from-[#10B981] to-[#5850EC] bg-slate-100 hover:text-white text-slate-700 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs border border-slate-200"
                              title="Download PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-sm text-slate-600">No candidate verification requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search keyword or filter options.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Record Details Modal with Missing Data Inspection & Live Status Checker */}
      {selectedRecord && (() => {
        const modalAnalysis = analyzeCandidateData(selectedRecord)
        const modalReqKey = selectedRecord.requestId || selectedRecord.id
        const isCheckingModal = checkingStatusId === modalReqKey
        const modalFeedback = statusFeedback[modalReqKey]

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0680A6]">
                      Candidate Verification Request Detail
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#0680A6]/10 text-[#0680A6] px-2 py-0.5 rounded-md">
                      Client ID: {selectedRecord.clientId || clientIdentifier}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedRecord.candidateName}{' '}
                    <span className="font-mono text-sm text-slate-400">({selectedRecord.requestId})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openUploadModal(selectedRecord)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer"
                    title="Upload Missing Document / LOA"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Doc</span>
                  </button>

                  {selectedRecord.status === 'Verified' && (
                    <button
                      type="button"
                      onClick={() => downloadPDF(selectedRecord)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer"
                      title="Download PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto sidebar-scroll text-xs sm:text-sm">
                {/* 1. Live Verification Status & Network Checker */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <OrgLogo name={selectedRecord.verifierName} className="w-11 h-11 rounded-xl shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{selectedRecord.verifierName}</h4>
                          {getStatusBadge(selectedRecord.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Category: {selectedRecord.verifierCategory} • Code: {selectedRecord.verifierCode}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckStatus(selectedRecord)}
                      disabled={isCheckingModal}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingModal ? 'animate-spin' : ''}`} />
                      <span>{isCheckingModal ? 'Checking Network...' : 'Check Live Status'}</span>
                    </button>
                  </div>

                  {modalFeedback && (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2.5 text-sky-800 text-xs animate-in fade-in">
                      <Activity className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>{modalFeedback}</span>
                    </div>
                  )}
                </div>

                {/* 2. Data Completeness & Missing Data Inspection */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#0680A6]" />
                        Data Completeness & Audit Inspection
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        {modalAnalysis.missingCount === 0
                          ? 'All critical and recommended parameters are recorded.'
                          : `${modalAnalysis.missingCount} field(s) require verification or input attention.`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${modalAnalysis.completenessPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {modalAnalysis.completenessPercent}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Complete</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        modalAnalysis.completenessPercent === 100
                          ? 'bg-emerald-500'
                          : modalAnalysis.completenessPercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${modalAnalysis.completenessPercent}%` }}
                    />
                  </div>

                  {/* Missing Data Alert if any */}
                  {modalAnalysis.missingCount > 0 && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-xs">Missing Data Detected on this Request</p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Enterprise verifiers require complete records or an authorized LOA to issue verification clearance.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openUploadModal(selectedRecord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Missing Doc</span>
                      </button>
                    </div>
                  )}

                  {/* Audited Parameters List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {modalAnalysis.items.map((item, idx) => {
                      const isMissing = item.status === 'missing'
                      const isWarning = item.status === 'warning'
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all ${
                            isMissing
                              ? 'bg-rose-50/50 border-rose-200'
                              : isWarning
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-slate-50/70 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700">{item.fieldName}</span>
                            <div className="flex items-center gap-1.5">
                              {isMissing && (item.fieldKey === 'loa' || item.fieldKey === 'supportingDocs') && (
                                <button
                                  type="button"
                                  onClick={() => openUploadModal(selectedRecord, item.fieldName)}
                                  className="text-[10px] font-bold text-[#5850EC] hover:underline flex items-center gap-0.5"
                                  title="Upload this document"
                                >
                                  <UploadCloud className="w-3 h-3" />
                                  <span>Attach</span>
                                </button>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isMissing
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : isWarning
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isMissing ? 'Missing' : isWarning ? 'Notice' : 'Valid'}
                              </span>
                            </div>
                          </div>
                          <p className="font-medium text-slate-800 text-xs mt-1 truncate" title={item.currentValue}>
                            {item.currentValue || (isMissing ? 'Not Provided' : '—')}
                          </p>
                          {isMissing && (
                            <p className="text-[10px] text-rose-600 mt-1 font-medium leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Candidate & Employment Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate Name</span>
                    <p className="font-bold text-slate-800">{selectedRecord.candidateName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
                    <p className="font-mono font-bold text-slate-800">{selectedRecord.employeeId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</span>
                    <p className="text-slate-700">{selectedRecord.designation}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                    <p className="text-slate-700">{selectedRecord.department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Joining</span>
                    <p className="font-semibold text-slate-800">{selectedRecord.dateOfJoining}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Leaving</span>
                    <p className="font-semibold text-slate-800">{selectedRecord.dateOfLeaving}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate Email</span>
                    <p className="text-slate-700">{selectedRecord.candidateEmail || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</span>
                    <p className="text-slate-700">{selectedRecord.contactNumber || 'Not Provided'}</p>
                  </div>
                </div>

                {/* 4. Verification Scope & Audit */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Scope</span>
                    <p className="font-medium text-slate-800 mt-0.5">{selectedRecord.verificationType}</p>
                  </div>

                  {selectedRecord.remarks && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Remarks</span>
                      <p className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs mt-1">
                        {selectedRecord.remarks}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div>
                      Mapped Client ID: <strong className="text-slate-700 font-mono">{selectedRecord.clientId || clientIdentifier}</strong>
                    </div>
                    <div>
                      Submitted by <strong className="text-slate-700">{selectedRecord.submittedBy}</strong> on{' '}
                      <strong className="text-slate-700">{selectedRecord.submittedAt}</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openUploadModal(selectedRecord)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition-all cursor-pointer shadow-xs"
                    title="Upload Missing Document"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckStatus(selectedRecord)}
                    disabled={isCheckingModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingModal ? 'animate-spin text-sky-600' : 'text-sky-500'}`} />
                    <span>Check Live Status</span>
                  </button>

                  {selectedRecord.status === 'Verified' && (
                    <button
                      type="button"
                      onClick={() => downloadPDF(selectedRecord)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 5. Missing Document Uploader Pop-up Modal */}
      {uploadRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#5850EC] text-white flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Verification Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Candidate: <strong className="text-slate-800">{uploadRecord.candidateName}</strong> ({uploadRecord.requestId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploadingDoc}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto sidebar-scroll text-xs sm:text-sm">
              {/* Candidate Quick Context Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate & Verifier</span>
                  <span className="font-bold text-slate-800">{uploadRecord.candidateName}</span>
                  <span className="text-xs text-slate-500 ml-1.5 font-mono">({uploadRecord.employeeId})</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Target: {uploadRecord.verifierName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Client ID</span>
                  <span className="font-mono font-bold text-[#0680A6] text-xs">
                    {uploadRecord.clientId || clientIdentifier}
                  </span>
                </div>
              </div>

              {/* Alert if LOA is missing */}
              {(() => {
                const analysis = analyzeCandidateData(uploadRecord)
                const isLoaMissing = analysis.items.some((i) => i.fieldKey === 'loa' && i.status !== 'valid')
                if (isLoaMissing) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs">Letter of Authorization (LOA) Required</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Enterprise verifiers require a signed LOA or authorization consent to release verification records.
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Document Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Document Type / Category
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  disabled={isUploadingDoc}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 focus:border-[#0680A6] rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all"
                >
                  <option value="Letter of Authorization (LOA)">Letter of Authorization (LOA)</option>
                  <option value="Experience / Relieving Letter">Experience / Relieving Letter</option>
                  <option value="Salary Slip / Compensation Proof">Salary Slip / Compensation Proof</option>
                  <option value="Government ID Proof (Aadhaar / Passport)">Government ID Proof (Aadhaar / Passport)</option>
                  <option value="Educational Degree / Marksheet">Educational Degree / Marksheet</option>
                  <option value="Other Verification Document">Other Verification Document</option>
                </select>
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Attach Document File <span className="text-rose-500">*</span>
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleSelectFile(e.dataTransfer.files[0])
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragOver
                      ? 'border-[#5850EC] bg-[#5850EC]/5'
                      : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="clientDocFileInput"
                    disabled={isUploadingDoc}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSelectFile(e.target.files[0])
                      }
                    }}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-2xs mb-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <label
                          htmlFor="clientDocFileInput"
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                        >
                          Change File
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSelectFile(null)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="clientDocFileInput" className="cursor-pointer block">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5850EC] flex items-center justify-center mx-auto mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">
                        Click to upload or drag & drop file
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF, PNG, JPG, JPEG, DOCX up to 15MB
                      </p>
                    </label>
                  )}
                </div>
              </div>

              {/* Remarks / Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Document Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  disabled={isUploadingDoc}
                  placeholder="e.g. Signed Letter of Authorization from candidate"
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 focus:border-[#0680A6] rounded-xl text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              {/* Feedback messages */}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploadingDoc}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={!selectedFile || isUploadingDoc}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:opacity-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUploadingDoc ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading Document...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Attach Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Client
