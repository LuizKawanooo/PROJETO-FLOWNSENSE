export interface UserResponse {
  userId: string;  
  email: string;
  username: string;
}


export interface LoginResponse {
  accessToken: string; 
  userId: string;
  email: string;
}


export interface CreateUserDto {
  username: string;
  email: string;
  password?: string; 
}