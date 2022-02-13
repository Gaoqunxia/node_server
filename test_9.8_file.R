setwd("D:/code/server")
library(activityCounts)
my_data<-read.table("1066528_acceleration.txt")
my_data[2]<-my_data[2]*9.8
my_data[3]<-my_data[3]*9.8
my_data[4]<-my_data[4]*9.8
my_start_time<-"2022-02-5 22:30:10"
my_counts <- counts(data = my_data, hertz = 50,start_time = my_start_time)
x_minute<-c()
y_minute<-c()
z_minute<-c()
i<-1
second<-floor(length(my_data[,1])/50)
j<-0
x_temp<-0
y_temp<-0
z_temp<-0
while(i<=second){

   x_temp<-mean(my_counts[i:i+59,2])
  y_temp<-mean(my_counts[i:i+59,3])
  z_temp<-mean(my_counts[i:i+59,4])
  x_minute<-append(x_minute,x_temp)
  y_minute<-append(y_minute,y_temp)
  z_minute<-append(z_minute,z_temp)
  j<-0
  i<-i+60
}
i<-1
final_minute<-c()
while(i<=(second/60)){
  sum_temp<-(x_minute[i]+y_minute[i]+z_minute[i])
  final_minute<-append(final_minute,sum_temp/3)
  i<-i+1
}
final_score<-c(2,2,2,2,2)
i<-6
while(i<=(second/60)-1){
  as_temp<-350*(0.0069*final_minute[i-5]+0.0112*final_minute[i-4]+0.0118*final_minute[i-3]+0.0158*final_minute[i-2]+0.0472*final_minute[i-1]+0.03*final_minute[i]+0.0106*final_minute[i+1])
  final_score<-append(final_score,as_temp)
  i<-i+1
}
write(final_score,file = 'label3.txt')