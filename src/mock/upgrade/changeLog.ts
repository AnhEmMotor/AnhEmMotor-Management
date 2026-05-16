interface UpgradeLog {
  version: string // bảnquyểnsố
  title: string // Cập nhậtTieuDe
  date: string // Cập nhậtNgày
  detail?: string[] // Cập nhậtNoiDung
  requireReLogin?: boolean // làphủcầncầntrùngmớiDangNhap
  remark?: string // GhiChu
}

export const upgradeLogList = ref<UpgradeLog[]>([
  {
    version: 'v3.0.2',
    title: 'hỏiđềsửaphục、FormvớiRoutingthểnghiệmTốihóa',
    date: '2026-03-15',
    detail: [
      'sửaphục：phúvănquyểnTrình biên tậpKiểu dángBất thườnghỏiđề',
      'sửaphục：MenuđồngTênvôphápCuộncủahỏiđề',
      'sửaphục：đặcthùRoutingmởmởsauHiển thịkhôngtrắngtrangmặtcủahỏiđề',
      'sửaphục：WebSocket trùngliềnBất thườnghỏiđề',
      'sửaphục：đặcthùHoạt độngRoutingTham sốXuLyBất thườnghỏiđề',
      'Tốihóa：ArtForm、ArtSearchBar FormGửitrướcThêmthêmDữ liệuxóarửa，tránhmiễnvôhiệuchữđoạnGửiđếnsauđầu',
      'sửaphục：ArtTable với ElForm Sử dụng kết hợpgiờHoạt độngFormsoátnghiệmLỗicủahỏiđề',
      'sửaphục：ẨntửMenugiờchacấpMenubịmộtđồng thờiẨncủahỏiđề',
      'sửaphục：tĩnhtháiRoutingLàm mớisaunhảyvềTrangChucủahỏiđề',
      'sửaphục：art-table ThuocTinhtiếpthừaBất thườnghỏiđề',
      'sửaphục：PC đầuChuyển đổiđếnDiđộngđầusaulạichuyểnvề PC đầu，MenuvôphápkhôiphụcnguyênbànmặtBố cụccủahỏiđề'
    ]
  },
  {
    version: 'v3.0.1',
    title: 'bugsửaphục、Thêm mớicôngnăng',
    date: '2025-11-15',
    detail: [
      'sửaphục：RoutingDangKygiờKhôngtồntạiGiao diện (Interface)củatrùngphụcVui lòngcầuhỏiđề',
      'sửaphục：mộtphímtinhrútchânquyểnmởbaoThatBaicủahỏiđề',
      'Tốihóa：hoànthiệnRoutingCauHinhnghiệmtínhmáychế，từđộngđođồng thờiGợi ýphimộtcấpMenucủađườngCauHinhLỗi',
      'Tốihóa：Phía trênThanh tiến trìnhtànảnh',
      'Tốihóa：vite trướccấuxâyTốihóa',
      'Tốihóa：Vai、Viềnthốngmột',
      'Tốihóa：khóamàn hìnhtrangmặttrùngmớithiếtkế',
      'Tốihóa：Đăng xuấtMenugợitrướcThôngthấtthànhcủaTrực quanthểnghiệmKhônghảohỏiđề',
      'Thêm mới：ArtForm và ArtSearchBar Componentcủa label chiếctrìTùy chỉnhRenderHàm，Có thểthựchiệnmang tooltip bằngphụctạpTag',
      'Thêm mới：MenuQuản lýFormđóngphímchữđoạnThêm mới Tooltip Gợi ý，giảmđêNguoiDungCauHinhcửangưỡng',
      'Thêm mới：iconify Thêm mớiNgoạiđườngIconLoadingmôkiểu',
      'Thêm mới：Đăng xuấtThêm mới redirect ThuocTinh，dùngởtrùngmớiDangNhapsaunhảychuyểnđếnđốiứngtrangmặt',
      'Thêm mới：Đăng xuấttrùngmớivàovàoHeThongLưugiữNguoiDungThẻ Tab，liệu userId vàodòngthântính',
      'Thêm mới：đôicộtMenuThêm mớiNút',
      'Thêm mới：MenuIconhoànthiện',
      'Thêm mới：đaThẻ TabThêmthêmIcon',
      'Thêm mới：WebSocket liềntiếp'
    ]
  },
  {
    version: 'v3.0.0',
    title:
      'Sass trùngcấuvì Tailwind CSS，Iconfont thếđổivì Iconify，tínhnăng，mụclụcKếtcấu，vănphần tửtâmgiảitoànphươngvịTốihóa',
    date: '2025-11-9',
    requireReLogin: true,
    detail: [
      'Kiểu dángHeThongtrùngcấu：Sass toànmặtdờiDiđến Tailwind CSS，gợilênmởpháthiệusuấtvớiKiểu dángmộtđếntính',
      'IconphươngánNâng cấp：Iconfont thếđổivì Iconify，chiếctrìhơnphongphúcủaIconThư việnvớicầnLoading',
      'cấuxâyTốihóa：Đầy đủbaothểtíchbớtthiểu 1.3 MB，HiểntrứgợilênLoadingtínhnăng',
      'RoutingDangKytrùngcấu：toànmặttrùngcấuRoutingDangKyHeThong，tríchvàomặthướngDoiTuongthiếtkế，gợicaođạimãcủaCó thểduyhộtính、Có thểđothửtínhvàmởtriểnnănglực',
      'giácấuTốihóa：TốihóamụclụcKếtcấu，chứctráchgạchphầnhơnxóarõ，giảmđêNguoiDunghọctậpthànhquyểnvớitrêntaynanđộ',
      'tâmgiảiTốihóa：thốngmộtmôkhốitâmgiảiquyphạm，hoànthiệnmỗimộtchiếcComponentgiớithiệu、côngnăngMô tảvớiVí dụ sử dụng，giảmđêNguoiDunglýgiảithànhquyểnvớitrêntaynanđộ',
      'tínhnănggợilên：TốihóaCốt lõiđạimãLogic，gợilênHeThongvậndònghiệusuất',
      'thiếtkếHeThong：trùngcấuMàu sắcthểhệ，thốngmột UI Trực quanquyphạm，gợilêngiaomặtmộtđếntính',
      'MenuTốihóa：chi tiếthóaMenuKiểu dáng，TốihóanộpthểnghiệmvớiTrực quantrìnhhiện',
      'Componenttrùngcấu：trùngcấu ArtTextScroll Component，gợilêntínhnăngvớiCó thểduyhộtính',
      'hỏiđềsửaphục：sửaphục ArtForm、ArtSearchBar Tùy chỉnhComponentRenderBất thường',
      'côngnăngThêmcường：ArtForm、ArtSearchBar Thêm mới render ThuocTinh，chiếctrìTùy chỉnhComponentRender',
      'côngnăngThêmcường：useTable hooks Thêm mới visible ThuocTinh，dùngởkhốngchếcộtMacDinhlàphủHiển thị',
      'ứngkiểuTốihóa：Tốihóa ArtForm、ArtSearchBar lướicáchBố cục，thíchPhânđaloạimàn hìnhmànthướctấc',
      'tiếtngàycôngnăngThêmcường：lễhoaCauHinhchiếctrìvượtNgàyphạmviCaiDatvớiTùy chỉnhphátphónglầnsố',
      'ylạiCập nhật：Nâng cấpCốt lõiylạiđếnnhấtmớiổnđịnhbảnquyển',
      'CauHinhQuản lýTốihóa：Thêm mới setting.ts CauHinhvănphần tử，chiếctrìmộtphímphụcchếvớiĐặt lạiHeThongMacDinhCaiDat'
    ],
    remark:
      'trùngcầnGợi ý：quyểnlầnNâng cấpliên quanvàKiểu dángHeThong（Sass → Tailwind CSS）vớiIconThư viện（Iconfont → Iconify）củatầngtrùngcấu，ThuộcởpháhoạitínhCập nhật。xâynghịmớimụcmụcthẳngtiếpkhiếndùng v3.0，cũbảnquyểnmụcmụcKhôngxâynghịNâng cấp。'
  },
  {
    version: 'v2.6.1',
    title: 'bugsửaphục、traoquyềntrangThêmthêmChuDemàuChuyển đổicôngnăng',
    date: '2025-10-19',
    detail: [
      'sửaphụcLấyNguoiDungThongTin、LấyMenuGiao diện (Interface)Truy cậpvôhiệuDiaChitrùngphụcđiềudùnghỏiđề',
      'Nâng cấpbộphầnylạikiêmdung tailwindcss',
      'sửaphục ElButton circle môkiểuKiểu dáng',
      'sửaphục ElSlect vôphápthông quaphímChọnhỏiđề',
      'sửaphụcmangTham sốtĩnhtháiRoutingnhảychuyểnDangNhaptrangmặthỏiđề',
      'TốihóangoàibộliêntiếpMenuNhấnvịtrongTrạng thái',
      'traoquyềntrangThêmthêmChuDemàuChuyển đổicôngnăng'
    ]
  },
  {
    version: 'v2.6.0',
    title: 'đạimãTốihóa、bugsửaphục',
    date: '2025-10-16',
    detail: [
      'TốihóatinhrútbảnquyểnMenuDữ liệuKếtcấu，gợilênDữ liệumộtđếntính',
      'TốihóaquyểnđịamởphátcảnhmạnglạcVui lòngcầuđạilýCauHinh',
      'Tốihóa ElTree ComponentMacDinhKiểu dáng',
      'Thêm mới VsCode đẩygiới thiệuchènphần tửđóngCauHinh',
      'Tốihóa ElDropdown ComponentNhấnKích hoạtmôkiểudướicủanộpKiểu dáng',
      'mởtriểnDangKy、Mật khẩuĐặt lạitrangmặtPhía trênComponentchiếctrì',
      'TốihóaMenuqualọcLogic',
      'TốihóatrangmặtChuyển đổiHoatAnh，gợilênLoadingTốc độ',
      'TốihóaChế độ tốiVanBanMàu sắc',
      'sửaphụctĩnhtháiRoutingTùy chỉnhTrangChuđườngđầulầnTruy cậpnhảychuyểnDangNhaptranghỏiđề',
      'sửaphụcĐăng xuấtgiờđoảnTạmnhảychuyểnđến 500trangcủahỏiđề',
      'sửaphục v2.5.9 bảnquyểnTrangChuRoutingnhảychuyểnCauHinhthấthiệuhỏiđề',
      'sửaphục v2.5.9 từđộngXuấtbaomáychếXuấtđếncủacấuxâyBất thường'
    ],
    requireReLogin: true
  },
  {
    version: 'v2.5.9',
    title: 'đạimãTốihóa',
    date: '2025-10-12',
    detail: [
      'views vănphần tửmụclục、vănphần tửdanh、đạimãTốihóa',
      'useTable Phân trangVui lòngcầuchữđoạnThêmthêmtoànbộCauHinh tableConfig.ts',
      'TốihóaRoutingCauHinhvìmôkhốihóaKếtcấu',
      'LấyMenuGiao diện (Interface)khiếndùng apifox mock Dữ liệu（cầntại .env trong tương VITE_ACCESS_MODE thiếtvì backend môkiểu）'
    ]
  },
  {
    version: 'v2.5.8',
    title: 'ylạiNâng cấp、bugsửaphục',
    date: '2025-09-29',
    detail: [
      'vue、vite、element-plus bằngCốt lõiThư việnNâng cấp',
      'sửaphụcphúvănquyểnTrình biên tậpToàn màn hìnhlantầngcấphỏiđề',
      'sửaphụcBảngcộtxếpthứComponentVanBaníchhỏiđề',
      'sửaphụcthốngkếThẻđiềuphần tửđoán',
      'Tốihóa el-tag Kiểu dáng',
      'TốihóaPhía trênThanh tiến trìnhMàu sắc',
      'TốihóaTùy chỉnhChuDeCauHinh',
      'Tốihóa ElementPlus Tùy chỉnhChuDehỏiđề',
      'sửaphụcđường / với HOME_PAGE_PATH cùngvì / giờrahiệncủavôhạntrùngđịnhhướng'
    ],
    remark: 'doởmụcmụcylạiNâng cấp，node bảnquyểncầncầnNâng cấpđến v20.19.0 hoặclấytrên'
  },
  {
    version: 'v2.5.7',
    title: 'Thêm mớiFormComponent',
    date: '2025-09-14',
    detail: [
      'Thêm mới ArtForm Component',
      'sửaphụcmớibảnquyểnthung lũngcaxemthiết bịChuyển đổiChuDechớpsánghỏiđề',
      'TốihóaForm label Chiều caokhôngcóđốicănhỏiđề',
      'đầumàn hìnhbậtđộngtínhnăngTốihóa'
    ]
  },
  {
    version: 'v2.5.6',
    title: 'TốihóaNguoiDungthểnghiệm、bugsửaphục',
    date: '2025-09-06',
    detail: [
      'useTable loạikiểuđẩyXuấtTốihóa，KhôngcầncầntayđộngtruyềnchuyểnloạikiểulàCó thểthựchiệnloạikiểuGợi ý',
      'useTable removeColumn chiếctrìđaDữ liệuXóa',
      'useTable từđộngtínhứngthểchiếctrìTùy chỉnhCauHinh (src/utils/table/tableConfig.ts)',
      'useTable khôngDữ liệuxemthiết bịCanhBaoTốihóa',
      'api Giao diện (Interface)Vui lòngcầuđạimãTốihóa、api.d.ts loạikiểuTốihóa',
      'Tốihóa ArtTable Phía trênNútđổidòngvôpháptừthíchứnghỏiđề（Ví dụ：côngnăngVí dụ / tráiphảiBố cụcBảng）',
      'ArtTable Phân trangComponentvịtrongKiểu dángTốihóa',
      'ArtTable khôngTrạng tháiChiều caoMacDinhchốngđầy',
      'ArtButtonMore ComponentThêm mớiIcon、Màu sắcCauHinh',
      'ArtTableHeader Thêm mớiTimKiemNút，dùngởkhốngchếPhía trênTimKiemlancủaHiển thịvớiẨn',
      'ArtSearchBar label vìkhônggiờKhôngchiếmkhônggian',
      'BảngHanhDonglanKéo thảcấmthúccốđịnhcộtKéo thả',
      'VaiTroQuản lýtrangmặtGiao diện (Interface)đốitiếp、đạimãTốihóa',
      'MenuQuản lýtrangmặtTốihóa',
      'TốihóaCaiDatTrung tâmCuộntrangmặttheoCuộnhỏiđề',
      'mộtcấpRoutinglàngoàiliêngiờ，component soátnghiệmLogicTốihóa',
      'TốihóađịaảnhphảidướiVaikéođộnghỏiđề',
      'TốihóaChế độ tốiLàm mớitrangmặttrắngmàuNềnhỏiđề',
      'TốihóaBên tráiMenuNútgianhỏiđề',
      'DiđộngđầuHiển thịBên tráiMenu logo',
      'mạnglạcVui lòngcầuThêm mới showSuccessMessage，dùngởCauHinhlàphủHiển thịThanhCongTinNhan',
      'Thêm mớitoànbộXuLy lỗiCơ bảnKhunggiá',
      'sửaphụclôlượngXóachỉnhtrangDữ liệukhôngcóQuay lạitrênmộttrangcủabug',
      'sửaphụcHoạt độngRoutingTham sốXuấtđếncủahỏiđề',
      'sửaphụcHoạt độngRoutingCauHinh mộtcấpRoutinglà iframe trangmặtgiờ，Toàn màn hìnhhỏiđề',
      'Thêm mớiQuyenHandiễnthịVí dụ',
      'toànbộComponentthudùngkhácbướcLoadingsáchlược，gợilênđầumàn hìnhLoadingtínhnăng'
    ]
  },
  {
    version: 'v2.5.5',
    title: 'bugsửaphục、TốihóaNguoiDungthểnghiệm',
    date: '2025-08-17',
    detail: [
      'trùngcấu ArtSearchBar Component，chiếctrìThêmComponent、Formsoátnghiệmbằngnănglực',
      'useTable cộtCauHinh：chiếctrìHoạt độngCập nhậtnănglực',
      'sửaphụcđachiếcphúvănquyểnTrình biên tậpIconKhôngthốngmộthỏiđề',
      'TốihóaMàu sắcBộ chọnVai',
      'el-radio、el-checkbox thốngmộtKích thước',
      'art-stats-card Thêm mớitiểusốvị、phầnkýCauHinh',
      'RoutingCauHinhVí dụTốihóa',
      'Nâng caoBảngThêm mớiTùy chỉnhLấyDữ liệuVí dụ（bằngđợinóanh ấyVui lòngcầuhoànthànhsauThựcdòng useTable Dữ liệuLấy）',
      'useTable Thêm mới excludeParams，dùngởxếpchianào đóvàiTham sốKhôngvớiVui lòngcầu',
      'Tốihóađườngtínhdanhloạikiểuhỏiđề',
      'quyểnđịamởphátvượtTênCauHinhTốihóa',
      'sửaphục useTable XóanhấtsaumộtchỉnhtrangDữ liệukhôngcóQuay lạitrênmộttrangcủahỏiđề',
      'sửaphục echarts Biểu đồDữ liệuban đầuđầuhóa、Cập nhậtDữ liệuxemthiết bịbáoLỗi',
      'Xóa art-chart-empty Component',
      'Thêm mới ArtSearchBar ComponentVí dụ',
      'mạnglạcVui lòngcầuchiếctrì http Trạng tháimãvì 401 giờĐăng xuất',
      'TốihóamạnglạcVui lòngcầuĐăng xuấtđalầnGợi ýhỏiđề',
      'useTable ThuocTinh、PhuongThucmệnhdanhTốihóa',
      'DangNhaptrangUINâng cấp',
      '403 Không đủ quyền Không đủ quyền、404 Không tìm thấy Không tìm thấy、500trangmặtUINâng cấp'
    ]
  },
  {
    version: 'v2.5.4',
    title: 'bugsửaphục、TốihóaNguoiDungthểnghiệm',
    date: '2025-07-27',
    detail: [
      'sửaphụcLấyNguoiDungThongTinGiao diện (Interface)giờthứhỏiđềXuấtđếnRoutingDangKyMenuRenderLỗibug',
      'sửaphụcHoạt độngRoutingsoátnghiệmhỏiđềXuấtđếncủa iframe KhôngHiển thịbug',
      'sửaphục reset vănphần tửngônphápLỗi',
      'sửaphục ArtTable Dữ liệuloạikiểuLỗi',
      'RoutingDangKyThêm mới component soátnghiệm',
      'sửaphụcđịaảnhcuộnvòngCuộnphóngđạihỏiđề',
      'mạnglạcVui lòngcầu headers chiếctrìTùy chỉnhCauHinh',
      'Mở rộngdòngchiếctrì formatter Render'
    ]
  },
  {
    version: 'v2.5.3',
    title: 'bugsửaphục、TốihóaNguoiDungthểnghiệm',
    date: '2025-07-20',
    detail: [
      'ArtTable Componenttrùngcấu',
      'Element Plus Nâng cấpđến v2.10.2',
      'Tốihóa useTable Phân trangTham sốhỏiđề',
      'sửaphục ArtTable Chuyển đổiPhân trangKích thướcgiờThựcdònghailầnVui lòngcầubug',
      'TốihóamạnglạcVui lòngcầuVí dụ：ban đầuđầuhóaTham số、Phân trangmangmangTham sốhỏiđề',
      'TốihóaTimKiemNgàyphạmviTham sốXuLy',
      'Tốihóa el-date-picker ComponentVaihỏiđề',
      'Tốihóa el-select Component hover Kiểu dáng',
      'Thêm mớiBảngtráiphảiBố cụcVí dụ',
      'TimKiemComponent、Phân trangComponentChiều caogiảmđê',
      'TốihóaDangNhaptrangmặtThanh trượtHoatAnhKhoảng cáchgiờtrường',
      'TốihóaMenukhôngcótửMenuHiển thịcủahỏiđề'
    ]
  },
  {
    version: 'v2.5.2',
    title: 'bugsửaphục、TốihóaNguoiDungthểnghiệm',
    date: '2025-07-13',
    detail: [
      'Thêm mớimộtphímtinhrútchânquyển，khoáithuậnđặtmởphátcảnh',
      'TốihóaBảngvôDữ liệugiờbảngđầuKhôngHiển thịhỏiđề',
      'useTable hooks chiếctrìPhân trangchữđoạndanhTùy chỉnhảnhxạ',
      'sửaphục v2.5.0 Phía trênThanh tiến trìnhKhôngHiển thịhỏiđề',
      'sửaphụcBên tráiMenuchephủBất thườngHiển thịhỏiđề',
      'sửaphụcẨnnêncótửMenugiờvẫnHiển thịchacấpMenucủahỏiđề',
      'NgangMenu、hỗnhợpMenu、đôicộtMenuchiếctrìhuychươngHiển thị',
      'sửaphục stylelint XuấtđếncủaDangNhaptrangThanh trượtKiểu dángBất thường',
      'sửaphụcgiàcũDiđộngđầuthiếtđặt loading địnhvịhỏiđề',
      'khoáivàodiệnchiếctrìCauHinhvănphần tửmôkiểu',
      'lancôngnăngchiếctrìCauHinhvănphần tửmôkiểu',
      'toànbộSuKientổngđường mittBus loạikiểuantoànTốihóa',
      'chiếctrìTùy chỉnhTrangChuđường',
      'TốihóaDiđộngđầuCaiDattrongContainerChiều rộngKiểu dáng',
      'TốihóaDangNhaptrangnghiệmtínhThanh trượtVanBancưtrongHiệu quả',
      'RoutingchiếctrìCauHinh redirect bằngThuocTinh'
    ]
  },
  {
    version: 'v2.5.1',
    title: 'bugsửaphục、TốihóaNguoiDungthểnghiệm',
    date: '2025-07-08',
    detail: [
      'sửaphụcđầulầnDangNhapHeThonggiờ loading gợitrướcđóngđóngbug',
      'el-card、el-table NềnmàutheoHeThongDuy trìmộtđến',
      'sửaphục v2.5.0 bảnquyểntríchkhởicủaToàn màn hìnhtrangKiểu dángtầngcấpquađêbug',
      'sửaphục v2.5.0 bảnquyểntríchkhởicủaBảngMở rộngdòngbug'
    ]
  },
  {
    version: 'v2.5.0',
    title: 'Thêm mới useTable hooks Bảngphong、Componenttrùngcấu',
    date: '2025-07-06',
    remark: 'xâynghịNâng cấp，mangđếnhơncaohiệu、hơntrínăngcủaBảngmởphátthểnghiệm',
    detail: [
      'trùngcấu ArtTable、ArtTableHeader、ArtNotification Component',
      'Thêm mới useTable hooks Bảngphong，chiếctrìDữ liệuLấy、chuyểnđổi、ứngthíchPhân、trínăngCache（ở LRU pháp）、XuLy lỗi、cộtCauHinhvớichènkhe、Phân trangkhốngchế、Làm mớisáchlượcbằngCốt lõicôngnăng，toànmặtgợilênmởpháthiệusuấtvớiNguoiDungthểnghiệm',
      'sửaphụcMenuQuản lýTimKiemthẳngtiếpsửasửa pinia Dữ liệucủahỏiđề',
      'Dichia CountTo chènphần tử，thếđổivì ArtCountTo Component',
      'Echarts bảnquyểnNâng cấpđến 5.6.0',
      'sửaphụcRoutinggiữvệ loading chớpsánghỏiđề'
    ]
  },
  {
    version: 'v2.4.2.9',
    title: 'đạimãtrùngcấu、sửaphụcbug、TốihóaNguoiDungthểnghiệm',
    date: '2025-07-02',
    detail: [
      'MenuBố cục、Phía trênĐiều hướngđạimãtrùngcấu',
      'sửaphụcDiđộngđầukhóamàn hìnhtrangbộphầnxemthiết bịvôphápgiảikhóabug',
      'TốihóaDiđộngđầuMenuCuộnNguoiDungthểnghiệm',
      'TốihóaPhía trênMenuKiểu dánghỏiđề',
      'Phía trênMenuChiều rộngtừthíchứng，Có thểHiển thịThêmNoiDung，hỗnhợpMenuchiếctrìChuộttiêuCuộn',
      'asyncRoutes RoutingCauHinh auth_mark chữđoạnsửavì authMark',
      'đichiatrùngphụccủa components.d.ts vănphần tử，components.d.ts、auto-imports.d.ts bỗnglượcGửi',
      'TốihóaquốctếhóaNgôn ngữvănphần tửLoadingphươngkiểu，khácbướcsửathànhcùngbướcmôkiểu',
      'Tốihóa el-pagination Kích thướcKhôngmộtđếnhỏiđề'
    ]
  },
  {
    version: 'v2.4.2.8',
    title:
      'sửaphục v2.4.2.7 bảnquyểnTruy cập / đườnggiờHiển thị 404 Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy củahỏiđề',
    date: '2025-06-26'
  },
  {
    version: 'v2.4.2.7',
    title: 'bugsửaphục、TốihóaNguoiDungthểnghiệm',
    date: '2025-06-25',
    detail: [
      'RoutingchiếctrìCauHinhToàn màn hìnhmôkiểu',
      'RoutingchiếctrìtừđộngnhảychuyểnđếnMenucủathứmộtchiếccóhiệuRouting',
      'Hoạt độngRoutingThêm mới removeAllDynamicRoutes PhuongThuc，Có thểdùngởtriệtxóachianêncóHoạt độngRouting',
      'QuyenHanTùy chỉnhlệnhTốihóa、Thêm mớiVaiTroQuyenHanlệnh v-roles、Có thểdùngởkhốngchếnguyêntốcủaHiển thịvớiẨn',
      'sửaphụcDangNhaptrangmặtKéo thảComponent ArtDragVerify Chiều rộng、Màu sắcBất thườngbug',
      'sửaphục iframe trangmặthỗnhợpmôkiểu、đôicộtmôkiểuBất thườngbug',
      'Tốihóakhóamàn hìnhtrangmặtbị el-loading mặcthấubug',
      'vượtTênVui lòngcầumangmang cookie CauHinhtừcảnhbiếnlượngtrongLấy，MacDinhđóngđóng',
      'kimđốiSEO、Có thểTruy cậptínhlàmmộtvàiTốihóa',
      'Thêm mớiThẻ TabHanhDongVí dụ'
    ]
  },
  {
    version: 'v2.4.2.6',
    title: 'ComponenttrùngcấuvớitínhnăngTốihóa',
    date: '2025-06-23',
    detail: [
      'trùngcấu components/core/forms vănphần tửkẹpdướicủaFormđóngComponent，gợilênCó thểduyhộtínhvớimộtđếntính',
      'trùngcấu ArtBreadcrumb BreadcrumbĐiều hướngComponent，TốihóaLogicKếtcấuvớiKiểu dáng',
      'Tốihóa ArtChatWindow với ArtFastEnter Componentđạimã，gợilênCó thểđọctínhvớitínhnăng',
      'trùngcấu ArtFireworksEffect khóihoaHiệu quảComponent，HiểntrứgợilênRendertínhnăngvớiHoatAnhchuyểnthôngđộ',
      'README TaiLieuThêm mớiChính thứcmạngtrangliêntiếp，tiệnởNguoiDungXemmụcmụcTaiLieu'
    ]
  },
  {
    version: 'v2.4.2.5',
    title: 'Biểu đồComponenttrùngcấu',
    date: '2025-06-22',
    detail: [
      'trùngcấuBiểu đồComponent，TốihóađạimãKếtcấuvớiCó thểduyhộtính',
      'tinhchi tiếtđiềuchỉnhBiểu đồHoatAnhvớiChuDePhânmàuphươngán，gợilênTrực quanmộtđếntính'
    ]
  },
  {
    version: 'v2.4.2.4',
    title: 'Componenttrùngcấu、đạimãTốihóa',
    date: '2025-06-18',
    detail: [
      'ArtMenuRight Componenttrùngcấu',
      'ArtWatermark Thêmthêmloạikiểutâmgiải',
      'components/core/cards dướimặtcủaComponenttrùngcấu，đạimãTốihóa'
    ]
  },
  {
    version: 'v2.4.2.3',
    title: 'Componenttrùngcấu、đạimãTốihóa',
    date: '2025-06-18',
    detail: [
      'ArtResultPage Componenttrùngcấu',
      'ArtTextScroll ComponentđạimãTốihóa',
      'ArtException ComponentThêmthêmloạikiểuGợi ý',
      'ArtCutterImg ComponentKiểu dángTốihóa、ThêmthêmloạikiểuĐịnh nghĩa',
      'ArtVideoPlayer ComponentThêmthêmloạikiểuĐịnh nghĩa'
    ]
  },
  {
    version: 'v2.4.2.2',
    title: 'Componenttrùngcấu',
    date: '2025-06-16',
    detail: [
      'Quay lạiPhía trênComponenttrùngcấu',
      'IconBộ chọnComponenttrùngcấu',
      'HeThongLogoComponentThuocTinhbiếnhơn'
    ]
  },
  {
    version: 'v2.4.2.1',
    title: 'Componenttrùngcấu、Bugsửaphục',
    date: '2025-06-16',
    detail: [
      'ComponenttrùngcấulấyvàTốihóa',
      'sửaphụchỗnhợpMenudướithứmộtchiếcMenulànhúngbộMenunhảychuyểnbug'
    ]
  },
  {
    version: 'v2.4.2',
    title: 'BugsửaphụcvớithểnghiệmTốihóa',
    date: '2025-06-14',
    detail: [
      'trùngcấumạnglạcVui lòngcầumôkhối，ThêmcườngXuLy lỗi、loạikiểuantoànvớiđaNgôn ngữchiếctrì',
      'sửaphụcDiđộngđầuTimKiemlanvôphápCuộn、iPadđầutrangmặtCuộnBất thườnghỏiđề',
      'sửaphục el-dialog Bật draggable ThuocTinhsau，Tùy chỉnhHoatAnhthấthiệucủahỏiđề',
      'sửaphục 2.3.0 bảnquyểnquyểnđịatồntrữtrùngcấusau，XuấtđếnDangNhap、DangKybằngtrangmặtđaNgôn ngữCaiDatvôpháptrìlâuhóacủahỏiđề',
      'tríchXuất、cộtCaiDatđaNgôn ngữhoànthiện',
      'sửaphụcBảngcốđịnhcộtKhôngkhởilàmdùngbug',
      'RoutingCauHinhThêm mới activePath kíchsốngMenuđườngThuocTinh',
      'đichiaNguoiDungDanh sách、MenuQuản lýtrangmặtvôhiệuđạimã',
      'Cập nhậtkỹthuậtchiếctrìliêntiếp'
    ],
    requireReLogin: true
  },
  {
    version: 'v2.4.1.1',
    title: 'BugsửaphụcvớithểnghiệmTốihóa',
    date: '2025-06-07',
    detail: [
      'sửaphụcMenuQuản lý bug',
      'TốihóaVaiTroQuản lýtrangmặtđạimã',
      'sửaphụcBảngDữ liệuvìkhôngChiều caovôhạnbiếnđạibug',
      'el-dialogTrực quanHiệu quảTốihóa，chiếctrìCauHinhđườngđiều',
      'HeThongChuDemôkiểutừLightsửathànhtheoHeThongmôkiểu'
    ]
  },
  {
    version: 'v2.4.1',
    title: 'TốihóaMenunộpthểnghiệm、Echarts Biểu đồtínhnăngTốihóa',
    date: '2025-06-07',
    detail: [
      'gợilênMenuHanhDongtheotaycảm',
      'trangmặtvàotrườngHoatAnhThoiGianbớtthiểu0.04s',
      'sửaphục Echarts Biểu đồComponenttạiPopuptrongKhôngHiển thịcủa bug',
      'Echarts Biểu đồtínhnăngTốihóa，Thêm mớiCó thểthịđồngTênban đầuđầuhóa、trongtồnPhònghộ、PhòngrungXuLy',
      'khóamàn hìnhtrạngdướicấmthúckhiếndùngmởphátCông cụphágiảikhóamàn hình'
    ]
  },
  {
    version: 'v2.4.0',
    title: 'đạimãtrùngcấuvớitàinguồnTốihóa',
    date: '2025-06-06',
    detail: [
      'toànbộ TypeScript loạikiểuthểhệtrùngcấu，gợilênloạikiểuthuậnChínhtínhvớiCó thểduyhộtính',
      'trùngcấu utils Công cụbao，thốngmộtCông cụPhuongThucKếtcấu，ThêmcườngCó thểđọctínhvớiphụcdùngtính',
      'utils Thêm mớiFormnghiệmtínhvới Cookie HanhDongđóngCông cụHàm',
      'XóaChưakhiếndùngcủaCông cụmôkhốivớivôhiệutàinguồn，tinhrútmụcmụcthểtích',
      'Tốihóa views trangmặtKếtcấu，Dichiathừathừatrangmặtvănphần tử',
      'trangmặtComponentThêmthêm defineOptions，minhChínhComponentmệnhdanh',
      'Trang lỗimặtđaNgôn ngữchiếctrì, gợilênquốctếhóathểnghiệm',
      'Hình ảnhtàinguồnthốngmộtchuyểnđổivì webp cáchkiểu，chỉnhthểtàinguồnthểtíchbớtthiểuhẹn 50%',
      'mởbaosinhvậtbớtthiểuhẹn 1MB，gợicaoLoadinghiệusuất',
      'HTTP Vui lòngcầuThêmthêm token quakỳtừđộngXuLyLogic，gợilênantoàntínhvớiNguoiDungthểnghiệm'
    ],
    requireReLogin: true
  }
])
