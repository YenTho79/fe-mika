import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../components/UI';
import { colors } from '../constants/theme';

const FONTS = ['System', 'serif', 'monospace'];

const dummyPages = [
  "Chương 1: Tàn Tích Gaia\n\nKhông gian bên ngoài buồng lái chiếc phi thuyền tiêm kích 'Bóng Vuốt' tĩnh lặng đến rợn người. Kaelen tựa lưng vào chiếc ghế đệm da đã sờn rách, đôi mắt xám tro chăm chú nhìn vào bản đồ ba chiều đang lơ lửng giữa không trung. Những đốm sáng màu lam nhạt đại diện cho các hành tinh thuộc Vành Đai Bụi, trong khi một chấm đỏ nhấp nháy liên tục ở góc xa phía đông chính là mục tiêu của anh: Tàn tích cuối cùng của thư viện cổ Gaia.\n\nTheo truyền thuyết của các bộ tộc du mục vũ trụ, Gaia từng là hành tinh chứa đựng toàn bộ tri thức của nhân loại trước khi Kỷ Nguyên Băng Hà thứ hai càn quét và xóa sổ hoàn toàn nền văn minh bề mặt. Những gì còn sót lại giờ đây chỉ là một đống đổ nát trôi nổi vô định giữa không gian, được bảo vệ bởi những bẫy trọng lực tự nhiên và những phi thuyền tuần tra không người lái của Đế chế Stark.\n\nKaelen thở dài, ngón tay anh gõ nhẹ lên bảng điều khiển. Tiếng máy móc vận hành đều đặn phát ra từ khoang động cơ giúp anh giữ được sự tỉnh táo cần thiết. Là một thợ săn tiền thưởng tự do, Kaelen không quan tâm đến lịch sử hay cứu rỗi thế giới. Thứ anh cần là 'Lõi Năng Lượng Tối' – một báu vật được đồn đại là đang ẩn giấu trong phòng lưu trữ trung tâm của thư viện. Các nhà khảo cổ học chợ đen sẵn sàng trả một cái giá không tưởng cho nó: đủ để anh mua một hành tinh nhỏ ở rìa thiên hà và nghỉ hưu vĩnh viễn.\n\n'Hệ thống AI, kiểm tra mức độ bức xạ năng lượng xung quanh khu vực tiếp cận,' Kaelen ra lệnh bằng giọng trầm thấp.\n\n'Báo cáo thuyền trưởng, nồng độ hạt hadron đang tăng 15% so với mức an toàn. Lá chắn bảo vệ của phi thuyền đang hoạt động ở mức 82%. Khuyến nghị giảm tốc độ và kích hoạt chế độ ẩn mình,' tiếng nói cơ học của hệ thống thông tin phản hồi ngay lập tức.\n\nKaelen nhếch mép cười. Ẩn mình không phải là phong cách của anh. Kéo cần gạt điều tốc, chiếc Bóng Vuốt gầm rú lao thẳng vào vùng mây bụi vũ trụ, hướng về phía khối kiến trúc khổng lồ xám xịt đang dần hiện rõ sau làn sương mù điện từ...",
  "Càng tiến gần đến tàn tích thư viện Gaia, Kaelen càng cảm nhận rõ rệt áp lực của trọng lực nhân tạo xung quanh. Chiếc phi thuyền rung lắc dữ dội, hệ thống cảnh báo va chạm phát ra những tiếng bíp liên hồi đỏ rực cả khoang lái. Những mảnh vỡ kim loại từ các tàu chiến cổ đại va đập chan chát vào lớp vỏ hợp kim Titan của Bóng Vuốt. Kaelen ghì chặt tay lái, trán rịn mồ hôi. Anh phải đưa con tàu lách qua những khe hẹp giữa các khối đá khổng lồ trước khi các cảm biến nhiệt của Stark phát hiện ra sự hiện diện của anh.\n\n'Kích hoạt lá chắn phân tán sóng quét,' anh ra lệnh, tay nhanh chóng nhấn một chuỗi nút trên bảng điều khiển phụ.\n\nNgay lập tức, một luồng ánh sáng xanh lam nhạt bao phủ lấy phi thuyền, làm lệch hướng các tia quét radar từ chiếc tuần dương hạm Stark đang lảng vảng cách đó năm mươi hải lý vũ trụ. Chiếc Bóng Vuốt lướt nhẹ như một bóng ma, đáp xuống một bệ đáp đổ nát đã bị nứt toác làm đôi từ hàng thế kỷ trước.\n\nKaelen khoác lên mình bộ giáp nano chuyên dụng, vác khẩu súng trường plasma từ tính lên vai và kiểm tra lại nguồn năng lượng dự phòng. Cánh cửa áp suất mở ra, luồng không khí lạnh giá tràn vào cabin. Anh bước ra ngoài, đối mặt với khoảng không vô tận và kiến trúc vĩ đại của thư viện Gaia. Đó là một hình cầu khổng lồ với những vòng xoay đồng tâm lơ lửng xung quanh, dù hầu hết các vòng xoay này đã ngừng hoạt động và bị bao phủ bởi lớp băng vũ trụ dày đặc.\n\nAnh bước đi trên hành lang kính cường lực dẫn vào sảnh chính. Dưới chân anh, qua lớp kính mờ đục, là hàng triệu kệ sách điện tử cổ chứa hàng tỷ byte dữ liệu đã bị khóa chặt. Tất cả đều im lìm như một ngôi mộ tập thể của tri thức loài người. Kaelen tiến tới bảng điều khiển trung tâm, cắm thiết bị giải mã cầm tay vào cổng kết nối cổ điển.\n\n'Tiến trình giải mã: 5%... 12%...' màn hình hiển thị. Kaelen liếc nhìn xung quanh, bản năng sinh tồn của một thợ săn tiền thưởng mách bảo anh rằng có điều gì đó không ổn. Tiếng động nhỏ như tiếng bước chân kim loại vang lên từ phía sau các hàng cột đá đổ nát...",
  "Một chiếc drone chiến đấu kiểu cũ Stark bất ngờ lao ra từ bóng tối, họng súng laser của nó đỏ rực. Kaelen lập tức ngã người ra phía sau, cú ngã điệu nghệ giúp anh né được tia năng lượng cực mạnh xé toạc không khí, làm tan chảy một mảng cột đá phía sau. Không chần chừ, anh nâng khẩu súng trường plasma lên và bóp cò. Một luồng đạn màu tím đậm bắn ra, găm thẳng vào lõi năng lượng của chiếc drone khiến nó nổ tung thành trăm mảnh.\n\n'Chết tiệt, chúng đã phát hiện ra mình sớm hơn dự kiến,' Kaelen lẩm bẩm khi tiến trình giải mã cửa trung tâm đạt mức 90%.\n\nCánh cửa kim loại nặng nề từ từ nâng lên, để lộ ra một căn phòng rộng lớn với hàng nghìn luồng ánh sáng hologram lơ lửng giữa không trung. Đó là những bản ghi chép hình ảnh từ quá khứ, mô tả những ngày cuối cùng của Gaia trước khi bị hủy diệt. Ở giữa phòng, nằm trên một bệ nâng bằng đá obsidian, là một viên pha lê màu đỏ rực rỡ, phát ra những xung năng lượng mạnh mẽ làm biến dạng không gian xung quanh: Lõi Năng Lượng Tối.\n\nKaelen bước đến gần viên pha lê, hơi ấm từ nó tỏa ra xua tan đi cái lạnh giá của bộ giáp nano. Anh cẩn thiện đưa bàn tay bọc găng kim loại ra, chuẩn bị nhấc báu vật lên thì một giọng nói vang lên từ hệ thống loa hologram của phòng:\n\n'Chào mừng thợ săn. Ngươi là người thứ 1.402 cố gắng lấy đi trái tim của Gaia. Tất cả những kẻ trước ngươi đều đã trở thành một phần của lớp băng ngoài kia.'\n\nHình chiếu của một người đàn ông trung niên mặc áo choàng trắng xuất hiện bên cạnh bệ đá. Đôi mắt của hình chiếu vô hồn nhưng dường như vẫn dõi theo từng cử động của Kaelen. Đó chính là người sáng lập ra thư viện, Tiến sĩ Aris.\n\n'Ta không đến đây để nghe kể chuyện lịch sử, tiến sĩ,' Kaelen lạnh lùng đáp, ngón tay anh chỉ còn cách viên pha lê vài centimet.\n\n'Lõi này không phải là nguồn năng lượng đơn thuần,' hình chiếu tiếp tục nói như thể đang phát lại một đoạn ghi âm tự động. 'Nó là chìa khóa kích hoạt hệ thống tự hủy của toàn bộ tàn tích này để ngăn tri thức Gaia rơi vào tay Stark. Nếu ngươi lấy nó đi, ngươi chỉ có chính xác 180 giây để thoát khỏi đây trước khi mọi thứ sụp đổ vào một hố đen nhân tạo...'",
  "Kaelen cắn chặt môi. 180 giây là quá ít để anh có thể chạy trở lại bệ đáp nơi Bóng Vuốt đang đỗ, chưa kể đến việc phải lái tàu vượt qua bẫy trọng lực Stark đang siết chặt. Nhưng nhìn vào viên pha lê đỏ rực rỡ trước mắt, anh biết mình không thể quay về tay trắng. Số nợ của anh tại trạm không gian Cerberus đủ để khiến anh bị bán làm nô lệ khai thác mỏ nếu không thanh toán trong tuần này.\n\n'Kích hoạt chế độ khẩn cấp của phi thuyền,' Kaelen nói qua bộ đàm liên lạc gắn tai. 'Bóng Vuốt, khởi động động cơ và chuẩn bị cất cánh tự động. Ta sẽ nhảy thẳng từ lối thoát hiểm phía tây.'\n\n'Cảnh báo: Hành vi này có tỷ lệ sống sót chỉ đạt 34%,' hệ thống AI phản hồi.\n\n'Đủ để cá cược rồi,' Kaelen đáp. Anh dứt khoát chụp lấy viên pha lê Lõi Năng Lượng Tối và giật mạnh ra khỏi bệ đá.\n\nNgay lập tức, một tiếng gầm rú chấn động vang lên từ lòng đất. Hệ thống hologram vụt tắt, căn phòng chìm vào bóng tối ngoại trừ ánh sáng đỏ gay gắt từ hệ thống cảnh báo tự hủy. Trần nhà bắt đầu nứt toác, những khối đá khổng lồ rơi xuống như mưa. Kaelen quay người chạy hết tốc lực về phía hành lang hướng tây.\n\nTrọng lực xung quanh bắt đầu đảo lộn. Anh có cảm giác cơ thể mình nhẹ bẫng đi, rồi đột ngột bị kéo mạnh về phía sau khi lực hút của hố đen nhân tạo bắt đầu hình thành tại tâm của căn phòng cổ. Mỗi bước chạy của anh giờ đây nặng nề như thể đang mang hàng tấn chì. Anh nhìn đồng hồ đếm ngược trên mũ giáp: 120 giây.\n\nNhững tiếng nổ lớn liên tục phát ra từ phía sau, nuốt chửng từng mảng hành lang kính. Kaelen nhảy qua một hố sụt lớn, tay bám chặt vào một thanh xà kim loại lơ lửng. Anh đu người lên và tiếp tục chạy. Phía trước anh, ánh sáng vũ trụ từ lối thoát hiểm phía tây đã hiện ra, nhưng đi kèm với đó là một chiếc tàu tuần tra nhỏ của đế quốc Stark vừa đáp xuống để chặn đường...",
  "Tên lính Stark mặc bộ giáp hạng nặng bước xuống từ tàu tuần tra, nâng khẩu súng phun lửa laser hướng thẳng về phía Kaelen. Với chỉ còn 60 giây trên đồng hồ đếm ngược, Kaelen biết mình không có thời gian để giao chiến trực diện. Anh ném khẩu súng trường plasma trống rỗng về phía tên lính để làm chệch hướng chú ý, đồng thời rút khẩu súng lục xung lực giắt ở thắt lưng bắn hai phát vào bệ phóng tên lửa của chiếc tàu Stark.\n\nMột vụ nổ dây chuyền bùng lên, thổi bay tên lính và phá hủy hoàn toàn bệ phóng của tàu Stark. Sức ép từ vụ nổ đẩy Kaelen bay thẳng ra ngoài khoảng không vũ trụ.\n\nCơ thể anh trôi nổi tự do trong không gian không trọng lực. Trực giác mách bảo anh nhìn lại phía sau: Thư viện cổ Gaia vĩ đại đang co rúm lại, bị hút vào một điểm đen siêu nhỏ ở trung tâm hành tinh trước khi bùng phát thành một làn sóng năng lượng khổng lồ. Làn sóng chấn động quét qua, hất văng mọi mảnh vỡ và chiếc tàu Stark còn lại.\n\nNgay lúc đó, chiếc Bóng Vuốt lao tới dưới sự điều khiển tự động của AI. Cửa khoang chở hàng mở rộng. Kaelen dùng súng móc khóa bắn một sợi cáp titan găm chặt vào thành tàu, rồi kéo cơ thể mình vào trong khoang lái ấm áp ngay khi cửa sập đóng lại.\n\n'Chế độ nhảy không gian kích hoạt!' Kaelen hét lớn khi vừa ngồi vào ghế lái.\n\nChiếc phi thuyền rung chuyển mạnh mẽ, rồi đột ngột biến mất vào một vệt sáng kéo dài, để lại phía sau một vùng không gian trống rỗng, nơi thư viện cổ Gaia từng tồn tại hàng ngàn năm. Kaelen nhìn viên pha lê đỏ đang tỏa sáng trên bảng điều khiển và thở phào nhẹ nhõm. Anh đã sống sót, và lịch sử của thiên hà từ nay sẽ rẽ sang một hướng hoàn toàn mới..."
];

export default function DocSach() {
  const router = useRouter();
  const { chapter } = useLocalSearchParams();

  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < dummyPages.length - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <Screen padded={false} safeAreaTop={false}>
      <Header 
        title={`Đọc truyện ${chapter ? '- Chương ' + chapter : ''}`} 
        onBack={() => router.back()} 
        rightIcon="settings-outline"
        onRight={() => setSettingsVisible(true)}
      />
      
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: colors.text, fontSize, fontFamily, lineHeight: fontSize * 1.5 }}>
          {dummyPages[currentPage]}
        </Text>
      </ScrollView>

      {/* Page Navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 0 && styles.disabledButton]} 
          onPress={handlePrevPage}
          disabled={currentPage === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentPage === 0 ? colors.muted : colors.primary} />
          <Text style={[styles.navText, currentPage === 0 && styles.disabledText]}>Trước</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>{currentPage + 1} / {dummyPages.length}</Text>

        <TouchableOpacity 
          style={[styles.navButton, currentPage === dummyPages.length - 1 && styles.disabledButton]} 
          onPress={handleNextPage}
          disabled={currentPage === dummyPages.length - 1}
        >
          <Text style={[styles.navText, currentPage === dummyPages.length - 1 && styles.disabledText]}>Sau</Text>
          <Ionicons name="chevron-forward" size={24} color={currentPage === dummyPages.length - 1 ? colors.muted : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal visible={settingsVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSettingsVisible(false)} activeOpacity={1}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tùy chỉnh giao diện</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Font Size Settings */}
            <Text style={styles.settingLabel}>Cỡ chữ: {fontSize}</Text>
            <View style={styles.settingRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
                <Ionicons name="remove" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setFontSize(Math.min(32, fontSize + 2))}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Font Family Settings */}
            <Text style={styles.settingLabel}>Phông chữ</Text>
            <View style={styles.settingRow}>
              {FONTS.map(font => (
                <TouchableOpacity 
                  key={font} 
                  style={[styles.fontButton, fontFamily === font && styles.activeFontButton]}
                  onPress={() => setFontFamily(font)}
                >
                  <Text style={[styles.fontButtonText, fontFamily === font && styles.activeFontText]}>{font}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(11,19,38,0.94)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 5,
  },
  disabledText: {
    color: colors.muted,
  },
  pageIndicator: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 10,
    marginTop: 20,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surface2,
    borderRadius: 12,
    minWidth: 55,
    alignItems: 'center',
  },
  fontButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surface2,
    borderRadius: 12,
  },
  activeFontButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  fontButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  activeFontText: {
    color: colors.primary,
    fontWeight: '900',
  }
});
