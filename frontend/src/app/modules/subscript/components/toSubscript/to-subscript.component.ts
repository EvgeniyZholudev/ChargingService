import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BillingAccountService} from '../../../../services/billingAccountService/billingAccount.service';
import {AuthorizationService} from '../../../../services/authorizationService/authorization.service';
import {ModalService} from '../../../../services/modalService/modal.service';
import {SubscriptService} from '../../../../services/subscriptService/subscript.service';
import {Subscript} from '../../../models/subscript';
import {ActiveSubscript} from '../../../models/active-subscript';
import {ActiveSubscriptService} from '../../../../services/activeSubscriptService/active-subscript.service';
import {ToastrService} from 'ngx-toastr';
import {BillingAccount} from '../../../models/billing-account';
import {User} from '../../../models/user';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-to-subscript',
  templateUrl: 'to-subscript.component.html'
})

export class ToSubscriptComponent implements OnInit, OnDestroy {


  @Input() selectedSubscript: Subscript;
  selectedBillingAccount: BillingAccount = new BillingAccount();
  @Input() authorizedUser: User;
  private subscriptions: Subscription[] = [];

  constructor(private billingAccountService: BillingAccountService, private authService: AuthorizationService,
              private modalService: ModalService, private subscriptService: SubscriptService,
              private activeSubscriptService: ActiveSubscriptService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  saveActiveSubscript(subscript: Subscript, billingAccount: BillingAccount): void {
    let activeSubscript: ActiveSubscript = new ActiveSubscript();
    activeSubscript.subscript = subscript;
    activeSubscript.billingAccountId = billingAccount.id;
    this.subscriptions.push(this.activeSubscriptService.saveActiveSubscript(activeSubscript).subscribe(data => {
      this.authService.authorizedUser.billingAccounts.find(
        searchable => searchable.id == billingAccount.id).activeSubscripts.push(data);
      this.closeModal();
      this.toastr.success('Вы успешно подписались на данный ресурс!', data.subscript.name);
    }, error => {
      this.toastr.error('Приносим извинения за неудобства', 'Ошибка сервера');
    }));


  }

  closeModal(): void {
    this.modalService.closeModal();
    this.selectedBillingAccount = new BillingAccount();
    this.selectedSubscript = new Subscript();
  }

  getSelectedBASubscriptsLength(billingAccount: BillingAccount): string {
    return this.billingAccountService.getSelectedBASubscriptsLength(billingAccount);
  }

  isSelectedBAIdUndefined(billingAccount: BillingAccount): boolean {
    return this.billingAccountService.isSelectedBAIdUndefined(billingAccount);
  }

  isBalanceMoreThanSubscribePrice(subscript: Subscript, billingAccount: BillingAccount): boolean {
    return this.billingAccountService.isBalanceMoreThanSubscribePrice(subscript, billingAccount);
  }
}
