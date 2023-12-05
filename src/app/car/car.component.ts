import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {CarResponse} from "../CarResponse";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.css']
})
export class CarComponent {

  carResponse ?: CarResponse;

  showText : boolean = false;
  showQuestion : boolean = false;
  showMessage: boolean = false;
  imageLoaded: boolean = false;

  levelImageUrl: string = '/assets/images/car_level.png';

  selectedTrivia : any | null = null; // Initialize it as null
  userAnswer : string = "";

  message: string = '';
  messageStyle: any = {};

  disableCheckAnswerButton: boolean = false;

  @ViewChild('questionBox') questionBox: ElementRef | undefined;

  @ViewChild('hintImage') hintImage: ElementRef | undefined;
  imageVisible: boolean = false; // New variable to control image visibility
  imageX: number = 0; // New variable to set the X-coordinate of the image
  imageY: number = 0; // New variable to set the Y-coordinate of the image
  hintIndex: number = 0;

  @ViewChild('levelImage', { static: false }) levelImage: ElementRef | undefined;

  constructor(private client: HttpClient, private renderer: Renderer2, private authService: AuthService, private router: Router) {
  }

  // load in the first level on init
  ngOnInit(): void {
    this.getLevel();
    this.updateHintPositions();
    this.showText = false;
  }

  // check for the coordinates to load in
  onImageLoad() {
    this.imageLoaded = true;
  }

  // this function loads the first level OnInit and calls the function getNextLevel to preload the second level
  getLevel() {
    this.client.get<CarResponse>(`${environment.baseUrl}/car/1`)
      .subscribe(
        result => {
          this.carResponse = result;
        },
      );
  }

  // shows the trivia on the specific coordinates when hovering with the mouse
  showInfo(trivia: any) {
    this.selectedTrivia = trivia;
    this.showText = true;
    // Set the cursor to pointer
    document.body.style.cursor = 'pointer';
  }

  // hides the trivia, when no longer hovering with the mouse
  hideInfo() {
    this.selectedTrivia = null;
    this.showText = false;
    // Restore the default cursor
    document.body.style.cursor = 'auto';
  }

  // shows the div with the question in it
  getQuestion() {
    this.showQuestion = !this.showQuestion;
  }

  // post request to backend to check the user answer with ai
  checkAnswer() {
    if (!this.disableCheckAnswerButton) {
      // Send the user's answer and the levelId to the backend for validation
      const levelId = 1
      const userName: string = this.authService.getUsername() || '';
      const requestBody = {
        userAnswer: this.userAnswer,
        levelId: levelId, // Include levelId in the request body
        userName: userName
      };

      this.disableCheckAnswerButton = true;

      this.client.post(`${environment.baseUrl}/check-answer`, requestBody, {
        responseType: 'text', // Specify the response type as text
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }) // Set the content type header
      })
        .subscribe(
          (response) => {
            if (response === 'Correct') {
              // Correct answer
              this.message = 'Correct!';
              this.messageStyle = { color: 'green' };

              // Show a jumping coffee bean as loading image
              const carImg = this.renderer.createElement('img');
              this.renderer.setAttribute(carImg, 'src', '../../assets/images/happy_car.png');
              this.renderer.addClass(carImg, 'car-bean');
              if (this.questionBox) {
                this.renderer.appendChild(this.questionBox.nativeElement, carImg);
              }

              // 3-second timer before changing levels
              setTimeout(() => {
                // Remove coffee bean
                if (this.questionBox) {
                  this.renderer.removeChild(this.questionBox.nativeElement, carImg);
                }
                this.showMessage = false;
              }, 3000);
            } else if (response === 'Incorrect') {
              // Incorrect answer
              this.message = 'Incorrect. Try again.';
              this.messageStyle = { color: 'red' };
              this.disableCheckAnswerButton = false;
            } else {
              // Handle other backend errors
              this.message = 'Error: ' + response; // Display the server's error message
              this.messageStyle = { color: 'red' };
            }
            this.showMessage = true;
          },
          (error) => {
            console.error('Error validating answer:', error);
            this.message = 'Error communicating with the server. Please try again later.';
            this.messageStyle = { color: 'red' };
            this.showMessage = true;
          }
        );
    } else {
      // Handle the case when currentLevel is undefined
      console.log('No current level available');
    }
  }

  // shows am image on top of a level-specific trivia-coordinate
  // cycles through the three trivia-coordinates
  showHint() {
    this.imageVisible = false;  // Hide existing image if any
    const currentLevelId = 1;  // Assuming the current level id is 1
    if (this.carResponse && this.carResponse.triviaList && this.carResponse.triviaList.length > 0) {
      if (this.hintIndex < this.carResponse.triviaList.length) {
        const currentTrivia = this.carResponse.triviaList[this.hintIndex];
        this.highlightTrivia(currentTrivia);
        this.hintIndex++;
      } else {
        this.hintIndex = 0;  // Reset the hintIndex
        this.highlightTrivia(this.carResponse.triviaList[this.hintIndex]);  // Optionally show the first trivia again
        this.hintIndex++;
      }
    }
  }

  updateHintPositions(): void {
    if (this.carResponse && this.carResponse.triviaList) {
      const currentTrivia = this.carResponse.triviaList[this.hintIndex];
      if (currentTrivia) {
        this.highlightTrivia(currentTrivia);
      }
    }
  }

  // scales the hint coordinates to the window size
  highlightTrivia(trivia: any) {
    // Assuming you have a reference to the image using ViewChild or otherwise.
    // Here, I am using a reference named `levelImage`.
    if (!this.levelImage || !this.levelImage.nativeElement) return;  // Check if levelImage is available

    const scaledCoords = this.calculateScaledCoordinates(trivia.triviaCoordinates, this.levelImage.nativeElement).split(',').map(Number);
    const midX = (scaledCoords[0] + scaledCoords[2]) / 2;
    const midY = (scaledCoords[1] + scaledCoords[3]) / 2;

    this.imageX = midX;
    this.imageY = midY;

    // Make the image visible
    this.imageVisible = true;
  }

  // scales the trivia-coordinates to window size
  calculateScaledCoordinates(coordinates: any, imageElement: HTMLImageElement): string {
    const imageWidth = imageElement.width;
    const imageHeight = imageElement.height;

    // Calculate the scaled coordinates
    const scaledX1 = (coordinates.x1 * imageWidth) / 1365;
    const scaledY1 = (coordinates.y1 * imageHeight) / 768;
    const scaledX2 = (coordinates.x2 * imageWidth) / 1365;
    const scaledY2 = (coordinates.y2 * imageHeight) / 768;

    return `${scaledX1},${scaledY1},${scaledX2},${scaledY2}`;
  }
}
