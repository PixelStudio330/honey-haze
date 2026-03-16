import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@honeyhaze.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          return { 
            id: "1", 
            name: "Honey Guest", 
            email: credentials.email,
            image: "/images/avatars/sakura.jpg" 
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  // Removed trustHost because it's handled by env vars in this version
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', 
  },
  // This ensures debugging is easier if Vercel acts up
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };