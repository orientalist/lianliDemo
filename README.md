# Node.js Zendesk Integration

## 簡介
此專案是一個使用 Node.js 編寫的後端伺服器功能，旨在自動處理來自 SurveyCake 的問卷數據，並將其填寫結果轉換為 Zendesk 工單。該服務不僅能簡化客戶反饋流程，還能提高客戶支持的效率。

## 功能
- 接收和處理 SurveyCake 發送的請求
- 解析問卷填答數據並生成對應的 Zendesk 工單
- 自動創建使用者資訊在 Zendesk 中（可選）
- 將問卷填答詳細信息寫入 Zendesk 工單中，包括客製欄位和回應評論

## 安裝與使用方式

1. **克隆專案**
   ```bash
   git clone https://github.com/your-username/node-zendesk-integration.git
   cd node-zendesk-integration
   ```

2. **安裝依賴**
   專案需要使用到 `axios` 和 `node-fetch` 兩個模組。您可以使用 npm 進行安裝：
   ```bash
   npm install
   ```

3. **配置環境**
   - 在程式碼中填寫 Zendesk 的帳號資訊及 API Token。
   - 填寫相關的 API URL。

4. **執行程式**
   您可以將此程式發佈到支援 Node.js 的伺服器上，例如 AWS Lambda，或在本地運行：
   ```bash
   node yourFileName.js
   ```

## 必要的依賴模組清單
- [axios](https://www.npmjs.com/package/axios) - 用來處理 HTTP 請求
- [node-fetch](https://www.npmjs.com/package/node-fetch) - 用於在 Node.js 環境中使用 fetch API

```bash
npm install axios node-fetch
```

## 授權條款
此專案使用 MIT 授權條款。請參閱 [LICENSE](LICENSE) 文件以獲取更多信息。