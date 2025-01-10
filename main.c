#include <iostream>

using namespace std;

int gcd(int a,int b){
    return b ? gcd(b,a%b): a;
}
int main(){long long k;
cin >> k;
long long c=0;
for(long long d=1;;d++){
for(long long n=0;n<=d;n++){
if(gcd(n,d)==1){
c++;
if(c==k){
std::cout<<n<<"/"<<d;
return 0;
}
}
}
}
}
