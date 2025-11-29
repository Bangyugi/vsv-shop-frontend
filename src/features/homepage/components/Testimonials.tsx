import { Avatar, Container, Paper, Rating, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

const testimonials = [
  {
    name: "An Nguyen",
    rating: 5,
    comment:
      "Chất lượng sản phẩm tuyệt vời, giao hàng nhanh chóng! Tôi chắc chắn sẽ quay lại mua sắm ở đây lần nữa và giới thiệu cho bạn bè.",
    avatar: "A",
  },
  {
    name: "Binh Le",
    rating: 4.5,
    comment: "Mẫu mã đẹp, sẽ ủng hộ shop dài dài.",
    avatar: "B",
  },
  {
    name: "Chi Tran",
    rating: 5,
    comment: "Rất hài lòng với dịch vụ khách hàng của VSV Shop.",
    avatar: "C",
  },
  {
    name: "David Pham",
    rating: 4,
    comment:
      "Sản phẩm tốt, đóng gói cẩn thận. Sẽ tiếp tục ủng hộ shop trong tương lai.",
    avatar: "D",
  },
  {
    name: "Emily Vu",
    rating: 5,
    comment:
      "Giao diện website dễ sử dụng, tôi rất thích trải nghiệm mua sắm ở đây.",
    avatar: "E",
  },
];

const Testimonials = () => (
  <Container sx={{ py: 8 }}>
    <Typography
      variant="h4"
      component="h2"
      className="text-center font-bold"
      sx={{ marginBottom: "40px" }}
    >
      What Our Customers Say
    </Typography>
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      // navigation
      // pagination={{ clickable: true }}
      loop={true}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      breakpoints={{
        600: {
          slidesPerView: 2,
        },
        960: {
          slidesPerView: 3,
        },
      }}
      style={{ paddingBottom: "50px" }}
    >
      {testimonials.map((t) => (
        <SwiperSlide
          key={t.name}
          style={{
            height: "200px",
          }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar sx={{ bgcolor: "secondary.main", margin: "0 auto 16px" }}>
              {t.avatar}
            </Avatar>
            <Rating value={t.rating} readOnly precision={0.5} />
            <Typography
              variant="body1"
              className="italic select-none"
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                height: "100px",
              }}
            >
              "{t.comment}"
            </Typography>
            <Typography
              variant="subtitle2"
              className="font-bold text-center select-none"
            >
              - {t.name} -
            </Typography>
          </Paper>
        </SwiperSlide>
      ))}
    </Swiper>
  </Container>
);

export default Testimonials;
