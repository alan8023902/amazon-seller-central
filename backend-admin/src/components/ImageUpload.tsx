import React, { useState, useEffect } from 'react';
import { Upload, message, Button, Image } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { ADMIN_API_CONFIG } from '../config/api';
import type { UploadProps, UploadFile } from 'antd';

interface ImageUploadProps {
  productId?: string;
  currentImage?: string;
  onImageUploaded: (imageUrl: string, imageData: { filename: string; size: number }) => void;
  onImageRemoved?: () => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  productId,
  currentImage,
  onImageUploaded,
  onImageRemoved,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  // Sync imageUrl with currentImage prop changes and reset when switching products
  useEffect(() => {
    // Always reset to currentImage when props change
    setImageUrl(currentImage);
  }, [currentImage, productId]);

  const beforeUpload = (file: File) => {
    const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    if (!isValidType) {
      message.error('只能上传 JPEG、PNG、GIF 或 WebP 格式的图片！');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    
    return true;
  };

  const handleUpload = async (file: File) => {
    if (!productId) {
      message.error('请先保存产品后再上传图片');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${ADMIN_API_CONFIG.BASE_URL}/api/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '上传失败');
      }

      const result = await response.json();
      const fullImageUrl = `${ADMIN_API_CONFIG.BASE_URL}${result.data.imageUrl}`;
      
      // Update local state immediately
      setImageUrl(fullImageUrl);
      
      // Notify parent component
      onImageUploaded(fullImageUrl, {
        filename: result.data.imageFilename,
        size: result.data.imageSize
      });
      
      message.success('图片上传成功！');
    } catch (error: any) {
      message.error(error.message || '上传失败，请重试');
      // Revert to previous state on error
      setImageUrl(currentImage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl(undefined);
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  const uploadProps: UploadProps = {
    name: 'image',
    showUploadList: false,
    beforeUpload: (file) => {
      if (beforeUpload(file)) {
        handleUpload(file);
      }
      return false; // 阻止默认上传行为
    },
    disabled: disabled || loading,
    accept: 'image/*',
  };

  const uploadButton = (
    <div style={{ textAlign: 'center' }}>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {loading ? '上传中...' : '上传图片'}
      </div>
    </div>
  );

  return (
    <div>
      {imageUrl ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            width={200}
            height={200}
            src={imageUrl}
            style={{ objectFit: 'cover', border: '1px solid #d9d9d9', borderRadius: 6 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
          {!disabled && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #ff4d4f'
              }}
              size="small"
            />
          )}
        </div>
      ) : (
        <Upload {...uploadProps}>
          <div
            style={{
              width: 200,
              height: 200,
              border: '1px dashed #d9d9d9',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: disabled ? '#f5f5f5' : '#fafafa'
            }}
          >
            {uploadButton}
          </div>
        </Upload>
      )}
      
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        支持 JPEG、PNG、GIF、WebP 格式，文件大小不超过 5MB
      </div>
    </div>
  );
};

export default ImageUpload;
