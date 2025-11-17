import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseOutlined, StepForwardOutlined, StepBackwardOutlined, MinusOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Space, Modal, Input, InputNumber, Select, Slider, Card } from "antd";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import TextAreaCustom from "../FormElements/TextArea/TextAreaCustom";
import MiniLoader from "../CommonUI/Loader/MiniLoader";

interface Video {
  key: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  topic: string;
  order: number;
  status: string;
}

interface CourseVideosProps {
  courseId: string;
  topics: Array<{ label: string; value: string }>;
}

const CourseVideos: React.FC<CourseVideosProps> = ({ courseId, topics }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: 0,
    topic: "",
    order: 1,
    status: "published",
  });
  
  // Video player state
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      fetchVideos();
    }
  }, [courseId]);

  // Handle video loading when modal opens
  useEffect(() => {
    if (videoModalVisible && playingVideo) {
      // Reset video state when modal opens
      setVideoError(null);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Only handle direct video files, not YouTube
      if (!isYouTubeUrl(playingVideo.videoUrl) && videoRef.current) {
        setVideoLoading(true);
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
          if (videoRef.current && playingVideo) {
            videoRef.current.src = playingVideo.videoUrl;
            videoRef.current.load();
            videoRef.current.currentTime = 0;
          }
        }, 200);
        
        return () => clearTimeout(timer);
      }
    }
  }, [videoModalVisible, playingVideo]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(`${END_POINT.COURSES}/${courseId}/videos`, true);
      if (response.error) throw new Error(response.error);
      
      const videosList = (response.data || []).map((video: any) => ({
        key: video._id || video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        duration: video.duration,
        topic: video.topic,
        order: video.order,
        status: video.status,
      }));
      setVideos(videosList);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch videos");
      // Keep mock data as fallback
      const mockVideos: Video[] = [
        {
          key: "1",
          title: "Getting Started",
          description: "Introduction video",
          videoUrl: "https://example.com/video1.mp4",
          duration: 600,
          topic: "1",
          order: 1,
          status: "published",
        },
      ];
      setVideos(mockVideos);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      topic: "",
      order: videos.length + 1,
      status: "published",
    });
    setModalVisible(true);
  };

  const handleEditVideo = (record: Video) => {
    setEditingVideo(record);
    setFormData({
      title: record.title,
      description: record.description,
      videoUrl: record.videoUrl,
      duration: record.duration,
      topic: record.topic,
      order: record.order,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const response = await API.DeleteAuthAPI(videoId, `${END_POINT.COURSES}/${courseId}/videos`, true);
      if (response.error) throw new Error(response.error);
      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete video");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.videoUrl.trim()) {
      toast.error("Video URL is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        topic: formData.topic,
        order: formData.order,
        status: formData.status,
      };

      if (editingVideo) {
        const response = await API.updateAuthAPI(payload, editingVideo.key, `${END_POINT.COURSES}/${courseId}/videos`, true);
        if (response.error) throw new Error(response.error);
        toast.success("Video updated successfully");
      } else {
        const response = await API.postAuthAPI(payload, `${END_POINT.COURSES}/${courseId}/videos`, true);
        if (response.error) throw new Error(response.error);
        toast.success("Video created successfully");
      }

      setModalVisible(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to save video");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isYouTubeUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    // Check for various YouTube URL formats
    const youtubePatterns = [
      /youtube\.com\/watch\?v=/,
      /youtu\.be\//,
      /youtube\.com\/embed\//,
      /youtube\.com\/v\//,
    ];
    return youtubePatterns.some(pattern => pattern.test(url));
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || !url.trim()) return null;
    
    // Try multiple patterns to extract video ID
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#\/]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
      /embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    // Create embed URL with necessary parameters
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0`;
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    
    // Accept YouTube URLs
    if (isYouTubeUrl(url)) {
      return true;
    }
    
    // Check if it's a valid direct video URL format
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m3u8'];
    const isDirectVideoUrl = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // For now, accept any URL that looks like it might be a video
    // The browser will try to load it and show an error if it fails
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:');
  };

  const handlePlayVideo = (video: Video) => {
    // Validate video URL
    if (!validateVideoUrl(video.videoUrl)) {
      toast.error("Invalid video URL. Please provide a direct video file URL (e.g., .mp4, .webm) or a YouTube link");
      return;
    }

    setPlayingVideo(video);
    setVideoModalVisible(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoDuration(video.duration || 0);
    setVideoError(null);
    setVideoLoading(false); // YouTube videos don't need loading state
    
    // Reset video element when modal opens (only for direct video files)
    if (!isYouTubeUrl(video.videoUrl) && videoRef.current) {
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.currentTime = 0;
          setVideoLoading(true);
        }
      }, 100);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error: any) {
        console.error("Error playing video:", error);
        toast.error("Failed to play video: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Update duration if available from video element
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setVideoDuration(videoRef.current.duration);
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      if (duration && !isNaN(duration)) {
        setVideoDuration(duration);
      }
      setCurrentTime(0);
      setVideoLoading(false);
      setVideoError(null);
    }
  };

  const handleVideoCanPlay = () => {
    setVideoLoading(false);
    setVideoError(null);
  };

  const handleVideoWaiting = () => {
    setVideoLoading(true);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setVideoLoading(false);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoError = (e: any) => {
    const video = videoRef.current;
    let errorMessage = "Failed to load video.";
    
    if (video) {
      const error = video.error;
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = "Video loading was aborted. Please check your network connection.";
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = "Network error while loading video. Please check your internet connection.";
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = "Video decoding error. The video file may be corrupted or in an unsupported format.";
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Video format not supported or source not found. Please use a direct video file URL (e.g., .mp4, .webm).";
            break;
          default:
            errorMessage = `Video error: ${error.message || "Unknown error"}`;
        }
      }
    }
    
    console.error("Video error:", e, video?.error);
    setVideoError(errorMessage);
    setVideoLoading(false);
    toast.error(errorMessage);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || videoDuration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.src = ''; // Clear source to stop loading
    }
    setVideoModalVisible(false);
    setPlayingVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoDuration(0);
    setVideoLoading(false);
    setVideoError(null);
  };

  // Group videos by topic
  const getTopicName = (topic: any): string => {
    if (typeof topic === 'string') {
      // If topic is a string (ID), find the topic name from topics array
      const topicObj = topics.find(t => t.value === topic);
      return topicObj?.label || topic || 'No Topic';
    }
    if (topic?.title) return topic.title;
    if (topic?.label) return topic.label;
    if (topic?.name) return topic.name;
    return 'No Topic';
  };

  const groupedVideos = videos.reduce((acc, video) => {
    let topicKey: string;
    if (typeof video.topic === 'string') {
      topicKey = video.topic;
    } else if (video.topic && typeof video.topic === 'object') {
      const topicObj = video.topic as any;
      topicKey = topicObj?._id || topicObj?.value || 'no-topic';
    } else {
      topicKey = 'no-topic';
    }
    const topicName = getTopicName(video.topic);
    
    if (!acc[topicKey]) {
      acc[topicKey] = {
        topicKey,
        topicName,
        videos: [],
      };
    }
    acc[topicKey].videos.push(video);
    return acc;
  }, {} as Record<string, { topicKey: string; topicName: string; videos: Video[] }>);

  const toggleTopic = (topicKey: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicKey)) {
        newSet.delete(topicKey);
      } else {
        newSet.add(topicKey);
      }
      return newSet;
    });
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      sorter: (a: Video, b: Video) => a.order - b.order,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (topic: any) => topic?.title || topic,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration: number) => formatDuration(duration),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "published" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: Video) => (
        <Space>
          <Button icon={<PlayCircleOutlined />} onClick={() => handlePlayVideo(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditVideo(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteVideo(record.key)} />
        </Space>
      ),
    },
  ];

  if (loading && videos.length === 0) return <MiniLoader />;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Videos</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddVideo}>
          Add Video
        </Button>
      </div>

      {/* Accordion-style Video List by Topic */}
      <div className="space-y-2">
        {Object.values(groupedVideos).map((group) => {
          const isExpanded = expandedTopics.has(group.topicKey);
          const sortedVideos = [...group.videos].sort((a, b) => a.order - b.order);
          
          return (
            <Card
              key={group.topicKey}
              className="mb-2"
              style={{ border: '1px solid #d9d9d9' }}
            >
              {/* Topic Header */}
              <div
                className="flex items-center justify-between cursor-pointer py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleTopic(group.topicKey)}
                style={{ userSelect: 'none' }}
              >
                <div className="flex items-center gap-3">
                  <Button
                    type="text"
                    icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTopic(group.topicKey);
                    }}
                  />
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white m-0">
                    {group.topicName}
                  </h4>
                  <Tag color="blue" className="ml-2">
                    {group.videos.length} {group.videos.length === 1 ? 'Video' : 'Videos'}
                  </Tag>
                </div>
              </div>

              {/* Videos List (shown when expanded) */}
              {isExpanded && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Table
                    columns={columns}
                    dataSource={sortedVideos}
                    loading={loading}
                    pagination={false}
                    size="small"
                    rowKey="key"
                  />
                </div>
              )}
            </Card>
          );
        })}

        {/* Show message if no videos */}
        {videos.length === 0 && !loading && (
          <Card className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No videos found. Add your first video to get started.</p>
          </Card>
        )}
      </div>

      <Modal
        title={editingVideo ? "Edit Video" : "Add Video"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingVideo ? "Update" : "Create"}
        width={700}
        okButtonProps={{ loading }}
      >
        <div className="space-y-4 py-4">
          <Input
            placeholder="Video title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextAreaCustom
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Video description"
                         rows={3}
           />
           <Input
             placeholder="Video URL (e.g., https://youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID, or https://youtube.com/embed/VIDEO_ID)"
             value={formData.videoUrl}
             onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
           />
           <div className="grid grid-cols-2 gap-4">
            <InputNumber
              placeholder="Duration (seconds)"
              value={formData.duration}
              onChange={(value) => setFormData({ ...formData, duration: value || 0 })}
              min={0}
              className="w-full"
            />
            <InputNumber
              placeholder="Order"
              value={formData.order}
              onChange={(value) => setFormData({ ...formData, order: value || 1 })}
              min={1}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              placeholder="Select Topic"
              value={formData.topic}
              onChange={(value) => setFormData({ ...formData, topic: value })}
              options={topics}
            />
            <Select
              placeholder="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={[
                { label: "Published", value: "published" },
                { label: "Draft", value: "draft" },
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        title={playingVideo?.title || "Video Player"}
        open={videoModalVisible}
        onCancel={handleCloseVideo}
        width={800}
        footer={null}
        centered
      >
        {playingVideo && (
          <div className="w-full">
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {isYouTubeUrl(playingVideo.videoUrl) ? (
                // YouTube Video Embed
                <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(playingVideo.videoUrl) || ''}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={playingVideo.title}
                  />
                </div>
              ) : (
                // Direct Video File
                <>
                  <video
                    ref={videoRef}
                    src={playingVideo.videoUrl}
                    className="w-full rounded-lg"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onCanPlay={handleVideoCanPlay}
                    onWaiting={handleVideoWaiting}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onError={handleVideoError}
                    onEnded={handleVideoEnded}
                    preload="metadata"
                    playsInline
                    style={{ width: '100%', height: 'auto', minHeight: '400px', objectFit: 'contain' }}
                  />
                  
                  {/* Loading Overlay */}
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-white text-center">
                        <MiniLoader />
                        <p className="mt-2">Loading video...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Overlay */}
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                      <div className="text-white text-center p-4">
                        <p className="text-red-400 mb-2">⚠️ {videoError}</p>
                        <p className="text-sm text-gray-300 mb-4">Video URL: {playingVideo.videoUrl}</p>
                        <Button 
                          type="primary" 
                          onClick={() => {
                            setVideoError(null);
                            if (videoRef.current) {
                              videoRef.current.load();
                            }
                          }}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Video Controls - Only for direct video files, not YouTube */}
            {!isYouTubeUrl(playingVideo.videoUrl) && (
              <div className="mt-4 space-y-3">
                {/* Progress Bar */}
                <Slider
                  value={currentTime}
                  max={videoDuration || playingVideo.duration || 1}
                  onChange={handleSeek}
                  disabled={!videoDuration && !playingVideo.duration}
                  tooltip={{
                    formatter: (value) => formatDuration(value || 0),
                  }}
                />
                
                {/* Time Display and Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(Math.floor(currentTime))} / {formatDuration(videoDuration || playingVideo.duration || 0)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      icon={<StepBackwardOutlined />} 
                      onClick={skipBackward}
                      disabled={!videoRef.current || videoError !== null}
                    />
                    <Button 
                      type="primary" 
                      size="large"
                      icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />} 
                      onClick={togglePlayPause}
                      disabled={videoLoading || videoError !== null}
                      loading={videoLoading}
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button 
                      icon={<StepForwardOutlined />} 
                      onClick={skipForward}
                      disabled={!videoRef.current || videoError !== null}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Video Description */}
            {playingVideo.description && (
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                <strong>Description:</strong> {playingVideo.description}
              </div>
            )}
            
            {/* Video URL Display (for debugging) */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 break-all">
              <strong>Video URL:</strong> {playingVideo.videoUrl}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseVideos;

