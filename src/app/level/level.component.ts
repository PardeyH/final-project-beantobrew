import {Component, OnInit, Renderer2, ViewChild, ElementRef} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {LevelResponse} from "../LevelResponse";
import {AuthService} from "../auth.service";
import { Router } from '@angular/router';


@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.css']
})
export class LevelComponent implements OnInit {

  levelResponse ?: LevelResponse;
  currentLevel ?: LevelResponse;
  preloadedLevel ?: LevelResponse;

  showText : boolean = false;
  showQuestion : boolean = false;
  showMessage: boolean = false;
  imageLoaded: boolean = false;

  levelCounter : number = 1;
  levelIndex : number = 0;
  levelList : string[] = [];
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
  }

  // check for the coordinates to load in
  onImageLoad() {
    this.imageLoaded = true;
  }

  // this function loads the first level OnInit and calls the function getNextLevel to preload the second level
  getLevel() {
    this.client.get<LevelResponse>(`${environment.baseUrl}/level/${this.levelCounter}`)
      .subscribe(
        result => {
          this.currentLevel = result;
          this.levelList.push(`${environment.baseUrl}${this.currentLevel.levelPath}`);
          this.getNextLevel();
          this.levelResponse = this.currentLevel;
        },
      );
  }

  // this function preloads the upcoming level
  getNextLevel() {
    this.levelCounter++;
    if (this.levelCounter <= 5) {
      this.client.get<LevelResponse>(`${environment.baseUrl}/level/${this.levelCounter}`)
        .subscribe(
          result => {
            this.preloadedLevel = result;
            this.levelList.push(`${environment.baseUrl}${this.preloadedLevel.levelPath}`);
          },
        );
    }
  }

  // Event on button-press "Next Level". It changes the scene to the following level and preloads the next level
  nextLevel() {
    if (this.levelIndex < this.levelList.length - 1) {
      this.levelIndex++;
      this.showText = false;
      this.showQuestion = false;
      this.userAnswer = "";
      this.imageVisible = false;

      // Update levelResponse with data of the preloaded level
      this.disableCheckAnswerButton = false;
      this.levelResponse = this.preloadedLevel;
      this.preloadedLevel = this.currentLevel;
      this.getNextLevel();
    } else {
      this.router.navigate(['/score']).then(() => {
        console.log('Navigation abgeschlossen');
      }).catch(error => {
        console.error('Fehler bei der Navigation:', error);
      });
    }
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
    if (this.currentLevel && !this.disableCheckAnswerButton) {
      // Send the user's answer and the levelId to the backend for validation
      const levelId = this.levelCounter - 1;
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
              const beanImg = this.renderer.createElement('img');
              this.renderer.setAttribute(beanImg, 'src', '../../assets/images/happy_bean.png');
              this.renderer.addClass(beanImg, 'coffee-bean');
              if (this.questionBox) {
                this.renderer.appendChild(this.questionBox.nativeElement, beanImg);
              }

              // 3-second timer before changing levels
              setTimeout(() => {
                // Remove coffee bean
                if (this.questionBox) {
                  this.renderer.removeChild(this.questionBox.nativeElement, beanImg);
                }
                this.showMessage = false;
                this.nextLevel(); // Automatically go to the next level
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
    this.imageVisible = false; // Hide existing image if any
    if (this.levelResponse && this.levelResponse.triviaList && this.levelResponse.triviaList.length > 0) {
      const currentLevelId = this.levelResponse.id;  // Assuming the current level id is here
      const lowerBound = (currentLevelId - 1) * 3 + 1;
      const upperBound = currentLevelId * 3;

      // Filter the triviaList based on current level
      const currentLevelTrivia = this.levelResponse.triviaList.filter(trivia => {
        return trivia.id >= lowerBound && trivia.id <= upperBound;
      });

      if (this.hintIndex < currentLevelTrivia.length) {
        const currentTrivia = currentLevelTrivia[this.hintIndex];
        this.highlightTrivia(currentTrivia);
        this.hintIndex++;
      } else {
        this.hintIndex = 0; // Reset the hintIndex
      }
    }
  }

  updateHintPositions(): void {
    if (this.levelResponse && this.levelResponse.triviaList) {
      const currentTrivia = this.levelResponse.triviaList[this.hintIndex];
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
    const scaledX1 = (coordinates.x1 * imageWidth) / 1456;
    const scaledY1 = (coordinates.y1 * imageHeight) / 816;
    const scaledX2 = (coordinates.x2 * imageWidth) / 1456;
    const scaledY2 = (coordinates.y2 * imageHeight) / 816;

    return `${scaledX1},${scaledY1},${scaledX2},${scaledY2}`;
  }
}
