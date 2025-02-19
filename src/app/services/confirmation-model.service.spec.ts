import { TestBed } from '@angular/core/testing';
import { ConfirmationModelService } from './confirmation-model.service';
import { ConfirmationModel } from '../../assets/models/ConfirmationModel';

describe('ConfirmationModelService', () => {
  let service: ConfirmationModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationModelService]
    });

    service = TestBed.inject(ConfirmationModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show model and return onButtonClick subject', () => {
    const confirmationData: ConfirmationModel = {
      heading: 'Test Heading',
      message: 'Test Message',
      leftButton: { text: 'Yes', customClass: 'grey-btn' },
      rightButton: { text: 'No', customClass: 'grey-btn' }
    };

    const onButtonClickSpy = spyOn(service.onButtonClick, 'next');

    const result = service.showModel(confirmationData);

    service.confirmationModelData$.subscribe(data => {
      expect(data).toEqual(confirmationData);
    });

    expect(result).toBe(service.onButtonClick);
    expect(onButtonClickSpy).not.toHaveBeenCalled();
  });

  it('should hide model', () => {
    service.hideModel();

    service.confirmationModelData$.subscribe(data => {
      expect(data).toBeNull();
    });
  });

  it('should have custom classes defined', () => {
    expect(service.CUSTOM_CLASS.GREY).toBe('grey-btn');
    expect(service.CUSTOM_CLASS.GREY_BLUE).toBe('grey-btn-blue');
    expect(service.CUSTOM_CLASS.GREY_RED).toBe('grey-btn-red');
  });
});