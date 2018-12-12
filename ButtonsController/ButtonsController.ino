#include <Adafruit_CircuitPlayground.h>
#define LEFT A1
#define RIGHT A2
bool leftButtonPressed;
bool rightButtonPressed;

void setup() {
  Serial.begin(9600);
  CircuitPlayground.begin();
  pinMode(26, OUTPUT);
  pinMode(LEFT, INPUT_PULLUP);
  pinMode(RIGHT, INPUT_PULLUP);

  digitalWrite(CPLAY_REDLED, HIGH);
}

void loop() {
 
if (digitalRead(LEFT)) {
    //  digitalWrite(13, HIGH);  // LED on
      Serial.print('A');
  } else {
    //  digitalWrite(13, LOW);  // LED off
      Serial.print('B');
  }
   Serial.print(',');

  if (digitalRead(RIGHT)) {
    //  digitalWrite(13, HIGH);  // LED on
      Serial.println('C');
  } else {
    //  digitalWrite(13, LOW);  // LED off
      Serial.println('D');
  }
  
  delay(50);
}
