package com.jarjisjo.medicationpregnancyapp

import android.content.IntentSender
import com.facebook.react.bridge.*
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

class InAppUpdateModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "InAppUpdate"

    @ReactMethod
    fun checkAndUpdate(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.resolve("NO_ACTIVITY")
            return
        }

        val appUpdateManager = AppUpdateManagerFactory.create(reactApplicationContext)

        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { info ->
                if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                    info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                    try {
                        appUpdateManager.startUpdateFlowForResult(
                            info,
                            activity,
                            AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build(),
                            UPDATE_REQUEST_CODE
                        )
                        promise.resolve("UPDATE_STARTED")
                    } catch (e: IntentSender.SendIntentException) {
                        promise.resolve("NO_UPDATE")
                    }
                } else {
                    promise.resolve("NO_UPDATE")
                }
            }
            .addOnFailureListener {
                promise.resolve("NO_UPDATE")
            }
    }

    companion object {
        const val UPDATE_REQUEST_CODE = 1001
    }
}
