import { Request, Response } from 'express';
import { 
  processAiConsultation, 
  optimizeBudgetCombo, 
  getSeasonalCalendarData, 
  getFactCooperatives, 
  getFactProducts 
} from './ai.service';

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Vui lòng cung cấp nội dung tin nhắn hợp lệ.' }
      });
      return;
    }

    const result = await processAiConsultation(message, history || []);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Lỗi xử lý yêu cầu tư vấn AI.' }
    });
  }
};

export const handleRecommendBudget = async (req: Request, res: Response) => {
  try {
    const { budget, recipient, purpose } = req.body;
    const budgetNum = Number(budget) || 500000;
    if (budgetNum <= 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Ngân sách phải lớn hơn 0 đồng.' }
      });
      return;
    }

    const combo = await optimizeBudgetCombo(budgetNum, recipient || 'gia đình', purpose || 'tiêu dùng');
    res.status(200).json({
      success: true,
      data: combo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Không thể tính toán gói sản phẩm phù hợp.' }
    });
  }
};

export const handleGetSeasonalCalendar = async (_req: Request, res: Response) => {
  try {
    const calendar = getSeasonalCalendarData();
    res.status(200).json({
      success: true,
      data: calendar
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Lỗi truy xuất lịch mùa vụ.' }
    });
  }
};

export const handleGetCooperatives = async (_req: Request, res: Response) => {
  try {
    const cooperatives = await getFactCooperatives();
    res.status(200).json({
      success: true,
      data: cooperatives
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Lỗi truy xuất danh sách hợp tác xã.' }
    });
  }
};

export const handleDraftRfq = async (req: Request, res: Response) => {
  try {
    const { companyName, contactName, phone, email, notes, requestedItems } = req.body;
    if (!companyName || !phone) {
      res.status(400).json({
        success: false,
        error: { message: 'Vui lòng cung cấp tên tổ chức/công ty và số điện thoại liên hệ.' }
      });
      return;
    }

    const rfqNumber = `RFQ-DN-${Date.now().toString().slice(-6)}`;
    const rfqDraft = {
      rfqNumber,
      createdAt: new Date().toISOString(),
      status: 'DRAFT_LOCAL',
      companyName,
      contactName: contactName || companyName,
      phone,
      email: email || '',
      notes: notes || 'Yêu cầu báo giá sỉ nông sản chính vụ Thành phố Đồng Nai',
      requestedItems: requestedItems || [
        { productName: 'Bưởi Đường Lá Cam Tân Triều (OCOP)', estimatedQuantity: '100 quả' },
        { productName: 'Hạt Điều Rang Muối Vỏ Lụa (Hộp 500g)', estimatedQuantity: '50 hộp' }
      ],
      assignedCooperative: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều / Long Khánh',
      processingTimeline: 'Bản nháp đã được khởi tạo trên hệ thống client. Để phục vụ đánh giá giải pháp AI, bạn có thể sao chép hoặc xuất file bản nháp này.',
      contactChannel: 'Cổng thông tin HTX Nông sản Thành phố Đồng Nai (Chế độ Thử Nghiệm / Demo)'
    };

    res.status(201).json({
      success: true,
      message: 'Đã tạo bản thảo yêu cầu báo giá sỉ (RFQ Draft) thành công!',
      data: rfqDraft
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Không thể tạo bản thảo báo giá sỉ.' }
    });
  }
};
